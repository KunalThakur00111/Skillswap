export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        // Handle Zod validation errors safely
        const validationErrors = error.issues || error.errors || [];
        
        // If we don't have validation errors, it might be an unexpected error
        if (validationErrors.length === 0) {
             return res.status(400).json({
                 success: false,
                 message: error.message || "Invalid request data"
             });
        }

        // Format the errors nicely for the frontend
        // Instead of returning a generic "Validation Error", return the first useful error message
        // so it displays properly on the frontend form without needing to map through an errors array
        const firstErrorMessage = validationErrors[0].message;

        const errors = validationErrors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));

        return res.status(400).json({
            success: false,
            message: firstErrorMessage, // This ensures the frontend gets the actual error (e.g. "Must be a .edu email")
            errors
        });
    }
};
