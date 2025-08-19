import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    // If no file is provided, return null
    if (!file) {
        console.log("No file provided to getDataUri");
        return null;
    }

    try {
        console.log("Processing file in getDataUri:", file.originalname);
        
        const parser = new DataUriParser();
        const extName = path.extname(file.originalname).toString();
        
        // Ensure the file buffer exists
        if (!file.buffer || file.buffer.length === 0) {
            console.error("File buffer is empty or undefined");
            return null;
        }
        
        const result = parser.format(extName, file.buffer);
        console.log("DataURI generated successfully, content length:", 
            result?.content ? result.content.substring(0, 50) + "..." : "No content");
        
        return result;
    } catch (error) {
        console.error("Error in getDataUri:", error);
        return null;
    }
}

export default getDataUri;