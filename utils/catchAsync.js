// Description: A utility function to catch errors in async route handlers
// This function wraps an async function and catches any errors that occur,
module.exports = (fn) => {
  // fn is a function that returns a promise
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
