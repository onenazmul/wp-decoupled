import validator from 'validator';
import isEmpty from './isEmpty';

const validateAndSanitizeCheckoutForm = (data) => {
    let errors = {};
    let sanitizedData = {};

    /**
     * Set the firstName value equal to an empty string if user has not entered the firstName, otherwise the Validator.isEmpty() wont work down below.
     * Note that the isEmpty() here is our custom function defined in is-empty.js and
     * Validator.isEmpty() down below comes from validator library.
     * Similarly we do it for for the rest of the fields
     */
    data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
    data.lastName = !isEmpty(data.lastName) ? data.lastName : '';
    data.companyName = !isEmpty(data.companyName) ? data.companyName : '';
    data.country = !isEmpty(data.country) ? data.country : '';
    data.streetAddressOne = !isEmpty(data.streetAddressOne) ? data.streetAddressOne : '';
    data.streetAddressTwo = !isEmpty(data.streetAddressTwo) ? data.streetAddressTwo : '';
    data.city = !isEmpty(data.city) ? data.city : '';
    data.county = !isEmpty(data.county) ? data.county : '';
    data.postCode = !isEmpty(data.postCode) ? data.postCode : '';
    data.phone = !isEmpty(data.phone) ? data.phone : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.createAccount = !isEmpty(data.createAccount) ? data.createAccount : '';
    data.orderNotes = !isEmpty(data.orderNotes) ? data.orderNotes : '';
    data.payment_method = !isEmpty(data.payment_method) ? data.payment_method : '';

    /**
     * Checks for error if required is true
     * and adds Error and Sanitized data to the errors and sanitizedData object
     *
     * @param {String} fieldName Field name e.g. First name, last name
     * @param {String} errorContent Error Content to be used in showing error e.g. First Name, Last Name
     * @param {Integer} min Minimum characters required
     * @param {Integer} max Maximum characters required
     * @param {String} type Type e.g. email, phone etc.
     * @param {boolean} required Required if required is passed as false, it will not validate error and just do sanitization.
     */
    const addErrorAndSanitizedData = (fieldName, errorContent, min, max, type = '', required) => {
        const postCodeLocale = process?.env?.POST_CODE_LOCALE ?? '';
        /**
         * Please note that this isEmpty() belongs to validator and not our custom function defined above.
         *
         * Check for error and if there is no error then sanitize data.
         */
        if (!validator.isLength(data[fieldName], { min, max })) {
            errors[fieldName] = `${errorContent} must be ${min} to ${max} characters`;
        }

        if ('email' === type && !validator.isEmail(data[fieldName])) {
            errors[fieldName] = `${errorContent} is not valid`;
        }

        if ('phone' === type && !validator.isMobilePhone(data[fieldName])) {
            errors[fieldName] = `${errorContent} is not valid`;
        }

        if (
            'postCode' === type &&
            postCodeLocale &&
            !validator.isPostalCode(data[fieldName], postCodeLocale)
        ) {
            errors[fieldName] = `${errorContent} is not valid`;
        }

        if (required && validator.isEmpty(data[fieldName])) {
            errors[fieldName] = `${errorContent} is required`;
        }

        // If no errors
        if (!errors[fieldName]) {
            sanitizedData[fieldName] = validator.trim(data[fieldName]);
            sanitizedData[fieldName] =
                'email' === type
                    ? validator.normalizeEmail(sanitizedData[fieldName])
                    : sanitizedData[fieldName];
            sanitizedData[fieldName] = validator.escape(sanitizedData[fieldName]);
        }
    };

    addErrorAndSanitizedData('firstName', 'First name', 2, 35, 'string', true);
    addErrorAndSanitizedData('lastName', 'Last name', 2, 35, 'string', true);
    addErrorAndSanitizedData('companyName', 'Company Name', 0, 35, 'string', false);
    addErrorAndSanitizedData('country', 'Country name', 2, 55, 'string', true);
    addErrorAndSanitizedData('streetAddressOne', 'Street address line 1', 10, 100, 'string', true);
    addErrorAndSanitizedData('streetAddressTwo', '', 0, 254, 'string', false);
    addErrorAndSanitizedData('city', 'City field', 3, 25, 'string', true);
    addErrorAndSanitizedData('county', '', false);
    addErrorAndSanitizedData('postCode', 'Post code', 2, 9, 'postCode', true);
    addErrorAndSanitizedData('phone', 'Phone number', 10, 15, 'phone', true);
    addErrorAndSanitizedData('email', 'Email', 11, 254, 'email', true);

    // The data.createAccount is a boolean value.
    sanitizedData.createAccount = data.createAccount;
    addErrorAndSanitizedData('orderNotes', '', 0, 254, 'string', false);
    addErrorAndSanitizedData('payment_method', 'Payment mode field', 2, 20, 'string', true);

    return {
        sanitizedData,
        errors,
        isValid: isEmpty(errors)
    };
};

export default validateAndSanitizeCheckoutForm;
