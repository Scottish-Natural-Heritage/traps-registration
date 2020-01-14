import {ReturnState} from './_base.js';

const convictionController = (req) => {
  // Did the user tell us they're free of convictions.
  if (req.body.conviction === 'yes') {
    // Then we don't have any errors. This clears any previous errors.
    req.session.convictionError = false;
    // Save the decision.
    req.session.conviction = req.body.conviction;
    // Follow the 'happy path'.
    return ReturnState.Positive;
  }

  // Did the user tell us they're not free of convictions.
  if (req.body.conviction === 'no') {
    // It's a silly answer, but we not an error. This clears any previous errors.
    req.session.convictionError = false;
    // Save the decision.
    req.session.conviction = req.body.conviction;
    // Go down the 'STOP' path.
    return ReturnState.Negative;
  }

  // The user submitted the form without selecting an option, this is an error!
  req.session.convictionError = true;
  // Unset any saved value.
  req.session.conviction = undefined;
  // Reload the page to highlight errors.
  return ReturnState.Error;
};

export {convictionController as default};