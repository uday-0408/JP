import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    // If no file is provided, return null
    if (!file) {
        return null;
    }

    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
}

export default getDataUri;