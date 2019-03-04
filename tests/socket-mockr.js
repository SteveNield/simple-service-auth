module.exports = (sandbox) => {
  const mock = {
    events: {}
  };

  mock.on = sandbox.stub().callsFake((key, handler) => {
    mock.events[key] = handler;
  });

  mock.emit = sandbox.stub().callsFake((key, data) => {
    if(!mock.events.hasOwnProperty(key)){
      throw new Error(`no event registered with key ${key}`);
    }
  
    mock.events[key](data);
  });

  return mock;
}