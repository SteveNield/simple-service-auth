const getBadRequestHandler = (res) => {
  return (err) => {
    console.warn(err);
    return res.sendStatus(401);
  }
}

module.exports = {
  getBadRequestHandler
}