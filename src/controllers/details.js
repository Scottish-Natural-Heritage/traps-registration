import {ReturnState} from './_base.js';

import utils from 'naturescot-utils';

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} body the incoming request's body
 * @returns {any} a json object that's just got our cleaned up fields on it
 */
const cleanInput = (body) => {
  return {
    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    fullName: body.fullName === undefined ? undefined : body.fullName.trim(),
    addressLine1: body.addressLine1 === undefined ? undefined : body.addressLine1.trim(),
    addressLine2: body.addressLine2 === undefined ? undefined : body.addressLine2.trim(),
    addressTown: body.addressTown === undefined ? undefined : body.addressTown.trim(),
    addressCounty: body.addressCounty === undefined ? undefined : body.addressCounty.trim(),
    addressPostcode: body.addressPostcode === undefined ? undefined : body.addressPostcode.trim(),
    phoneNumber: body.phoneNumber === undefined ? undefined : body.phoneNumber.trim(),
    emailAddress:
      body.emailAddress === undefined
        ? undefined
        : utils.formatters.stripAndRemoveObscureWhitespace(body.emailAddress.toLowerCase())
  };
};

const detailsController = (request) => {
  // Clean up the user's input before we store it in the session.
  const cleanForm = cleanInput(request.body);
  request.session.fullName = cleanForm.fullName;
  request.session.addressLine1 = cleanForm.addressLine1;
  request.session.addressLine2 = cleanForm.addressLine2;
  request.session.addressTown = cleanForm.addressTown;
  request.session.addressCounty = cleanForm.addressCounty;
  request.session.addressPostcode = cleanForm.addressPostcode;
  request.session.phoneNumber = cleanForm.phoneNumber;
  request.session.emailAddress = cleanForm.emailAddress;

  // Clear the general error...
  request.session.detailsError = false;
  // ...and the specific errors.
  request.session.nameError = false;
  request.session.addressError = false;
  request.session.townError = false;
  request.session.postcodeError = false;
  request.session.phoneError = false;
  request.session.emailError = false;

  // Check if each of the fields is invalid.
  if (request.body.fullName === undefined || request.body.fullName.trim() === '') {
    request.session.nameError = true;
  }

  if (request.body.addressLine1 === undefined || request.body.addressLine1.trim() === '') {
    request.session.addressError = true;
  }

  if (request.body.addressTown === undefined || request.body.addressTown.trim() === '') {
    request.session.townError = true;
  }

  // Call natureScot utils to check validity of postcode
  request.session.postcodeError =
    request.body.addressPostcode === undefined
      ? true
      : !utils.postalAddress.isaRealUkPostcode(request.body.addressPostcode);

  // The smallest, non-local, non-shortcode UK phone number is '08001111'.
  // The longest could be something like 	'+44 (01234) 567 890', but we're not
  // going to check for too much data at this time.
  if (
    request.body.phoneNumber === undefined ||
    request.body.phoneNumber.trim() === '' ||
    request.body.phoneNumber.trim().length < 8
  ) {
    request.session.phoneError = true;
  }

  if (request.body.emailAddress === undefined) {
    request.session.emailError = true;
  } else {
    try {
      utils.recipients.validateEmailAddress(request.body.emailAddress);
    } catch {
      request.session.emailError = true;
    }
  }

  // Check that any of the fields are invalid.
  request.session.detailsError =
    request.session.nameError ||
    request.session.addressError ||
    request.session.townError ||
    request.session.postcodeError ||
    request.session.phoneError ||
    request.session.emailError;

  // If we've seen an error in any of the fields, our visitor needs to go back
  // and fix them.
  if (request.session.detailsError) {
    return ReturnState.Error;
  }

  // Build the address array, ignoring any blank fields.
  const address = [];
  if (request.session.addressLine1 !== undefined && request.session.addressLine1.trim() !== '') {
    address.push(request.session.addressLine1);
  }

  if (request.session.addressLine2 !== undefined && request.session.addressLine2.trim() !== '') {
    address.push(request.session.addressLine2);
  }

  if (request.session.addressTown !== undefined && request.session.addressTown.trim() !== '') {
    address.push(request.session.addressTown);
  }

  if (request.session.addressCounty !== undefined && request.session.addressCounty.trim() !== '') {
    address.push(request.session.addressCounty);
  }

  if (request.session.addressPostcode !== undefined && request.session.addressPostcode.trim() !== '') {
    address.push(request.session.addressPostcode);
  }

  // Create the display versions of the visitors address and contact info.
  request.session.displayAddress = address.join('<br>');
  request.session.displayContact = `${request.session.phoneNumber}<br>${request.session.emailAddress}`;

  // The request passed all our validation, we've stored copies of everything we
  // need, so it's time to go on.
  return ReturnState.Positive;
};

export {detailsController as default};
