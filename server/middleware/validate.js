
// This   middleware    validates the    request body   using    Zod schema validation.
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.safeParse(req.body);
    // console.log("Request Body:", req.body);

    if (!req.body.success) {
        res.status(411).json({
            msg: "Incorrect inputs! or Error in zod validation"
        })
    };
    next();
  } catch (err) {
    if (!res.headersSent) {
      return res.status(400).json({ 
        errorHeaders: err.errors 
    });
    }
}};

