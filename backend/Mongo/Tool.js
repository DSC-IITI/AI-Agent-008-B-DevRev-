import mongoose from "mongoose";

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  fields: {
    type: Map, // Use Map to allow dynamic keys
    of: new mongoose.Schema({
      field_type: { type: String, required: true }, // Example: "int", "float", "string"
      description: { type: String, required: true }, // Description of the field
    }),
    required: true,
  },
});
const Tool = mongoose.model("Tool", toolSchema);
export default Tool;
