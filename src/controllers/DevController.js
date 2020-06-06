const axios = require("axios");
const Dev = require("../models/Dev");
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(request, response) {
    const devs = await Dev.find();
    return response.json(devs);
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await Dev.findOne({ github_username });
    if (!dev) {
      const resp = await axios.get(
        `https://api.github.com/users/${github_username}`
      );
      const { name = login, avatar_url, bio } = resp.data;
      const ArrTechs = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: ArrTechs,
        location,
      });

      const sendSocketMessageTo = findConnections(
        { latitude, longitude},
        ArrTechs,
      );

      sendMessage(sendSocketMessageTo, 'newDev', dev);

    }

    return response.json(dev);
  },

  async update(request, response) {
    const { techs } = request.body;
    const { _id } = request.params;
    const ArrTechs = parseStringAsArray(techs);
    let dev = await Dev.findOne({ _id });
    if(dev){
      dev.techs = ArrTechs;
      await dev.save();

      const { coordinates } = dev.location;

      const sendSocketMessageTo = findConnections(
        { latitude: coordinates[1], longitude: coordinates[0] },
        ArrTechs,
      );

      sendMessage(sendSocketMessageTo, 'upDev', dev);
    }

   return response.json(dev);
  },

  async destroy(request, response) {
    const { _id } = request.params;
    let dev = await Dev.findOne({ _id });

    if(dev){
      const { coordinates } = dev.location;
         const sendSocketMessageTo = findConnections(
        { latitude: coordinates[1], longitude: coordinates[0] },
        dev.techs,
      );

      sendMessage(sendSocketMessageTo, 'removeDev', _id);

      await dev.remove();
    }


    return response.json({ message: 'deletado'});
  }
};
