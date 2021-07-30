
function typeChecker(obj, schema) {
    Object.keys(schema).forEach((el) => {
        if (obj[el] == undefined)
            throw new Error(`${el} don't need undefined`);
        if (typeof obj[el] != typeof schema[el]())
            throw new Error(`${el} should be ${typeof schema[el]()}`);
    })
}

module.exports = {
    check: (place, schema) => {
        return (req, res, next) => {
            try {
                switch (place) {
                    case 'body':
                        typeChecker(req.body, schema)
                        break;
                    case 'params':
                        typeChecker(req.query, schema)
                        break;
                    default:
                        res.status(500).json({
                            result: "error",
                            message: "developer is teapot"
                        })
                        break;
                }

                next();
            } catch (e) {
                res.status(400).json({
                    result: "error",
                    message: e.message
                })
            }
        }
    }
}