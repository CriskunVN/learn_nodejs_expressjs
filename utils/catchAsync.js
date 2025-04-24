module.exports = (fn) => {
  // fn is a function that returns a promise
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
