import { useState, useEffect } from "react";
import {
  Send,
  Loader2,
  Terminal,
  AlertCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";
import React from "react";
import "./App.css";

export default function App() {
  const [tools, setTools] = useState([]);
  const [toolEntries, setToolEntries] = useState([
    {
      toolName: "",
      toolDescription: "",
      fieldRows: [{ name: "", type: "int", description: "" }],
    },
  ]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToolEntry = () => {
    setToolEntries([
      ...toolEntries,
      {
        toolName: "",
        toolDescription: "",
        fieldRows: [{ name: "", type: "int", description: "" }],
      },
    ]);
  };

  const removeToolEntry = (index) => {
    setToolEntries(toolEntries.filter((_, i) => i !== index));
  };

  const updateToolEntry = (index, field, value) => {
    const newEntries = [...toolEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setToolEntries(newEntries);
  };

  const addFieldRow = (toolIndex) => {
    const newEntries = [...toolEntries];
    newEntries[toolIndex].fieldRows.push({
      name: "",
      type: "int",
      description: "",
    });
    setToolEntries(newEntries);
  };

  const updateFieldRow = (toolIndex, rowIndex, field, value) => {
    const newEntries = [...toolEntries];
    newEntries[toolIndex].fieldRows[rowIndex] = {
      ...newEntries[toolIndex].fieldRows[rowIndex],
      [field]: value,
    };
    setToolEntries(newEntries);
  };

  const removeFieldRow = (toolIndex, rowIndex) => {
    const newEntries = [...toolEntries];
    newEntries[toolIndex].fieldRows = newEntries[toolIndex].fieldRows.filter(
      (_, i) => i !== rowIndex
    );
    setToolEntries(newEntries);
  };

  const addTools = async () => {
    const invalidEntries = toolEntries.some(
      (entry) =>
        !entry.toolName ||
        !entry.toolDescription ||
        entry.fieldRows.some((field) => !field.name || !field.description)
    );

    if (invalidEntries) {
      setError("Please fill all tool details and field information.");
      return;
    }

    try {
      for (const entry of toolEntries) {
        const fields = {};
        entry.fieldRows.forEach((row) => {
          fields[row.name] = {
            field_type: row.type,
            description: row.description,
          };
        });

        const response = await fetch("http://localhost:5000/define_tool/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: entry.toolName,
            description: entry.toolDescription,
            fields: fields,
          }),
        });
        try {
          for (const entry of toolEntries) {
            const fields = {};
            entry.fieldRows.forEach((row) => {
              fields[row.name] = {
                field_type: row.type,
                description: row.description,
              };
            });

            const response = await fetch("http://127.0.0.1:8000/define_tool/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: entry.toolName,
                description: entry.toolDescription,
                fields: fields,
              }),
            });

            if (!response.ok) throw new Error("Failed to define tool");
          }
        } catch (err) {
          setError("Failed to define tools. Please try again.");
        }

        if (!response.ok) throw new Error("Failed to define tool");
      }

      await fetchTools();
      setToolEntries([
        {
          toolName: "",
          toolDescription: "",
          fieldRows: [{ name: "", type: "int", description: "" }],
        },
      ]);
      setError(null);
    } catch (err) {
      setError("Failed to define tools. Please try again.");
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch("http://localhost:5000/list_tools/"); // Change this to your actual API route
      if (!response.ok) throw new Error("Failed to fetch tools");
      const data = await response.json();
      console.log(data);
      setTools(data.tools); // Assuming the response is an array of tools
    } catch (err) {
      setError("Failed to fetch tools. Please try again.");
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/invoke/?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      const toolsResponse =
        data.response.tool_calls?.map((tool) => ({
          name: tool.name,
          args: tool.args.kwargs, // Extract kwargs directly
        })) || [];

      console.log("Tools Response:", toolsResponse);
      setResponse(toolsResponse); // Store all tool responses in state
    } catch (error) {
      setError("Failed to fetch response. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="card">
          <div className="header">
            <div className="header-content">
              <Terminal className="header-icon" />
              <h1>AI Tool Interface</h1>
            </div>
            <p className="header-subtitle">
              Define your tools and start querying
            </p>
          </div>

          <div className="main-content">
            <div className="tool-definition">
              <div className="tool-header">
                <h2>Define New Tools</h2>
                <button onClick={addToolEntry} className="add-tool-entry-btn">
                  <PlusCircle /> Add Another Tool
                </button>
              </div>

              {toolEntries.map((entry, entryIndex) => (
                <div key={entryIndex} className="tool-entry">
                  <div className="tool-entry-header">
                    <h3>Tool #{entryIndex + 1}</h3>
                    {toolEntries.length > 1 && (
                      <button
                        onClick={() => removeToolEntry(entryIndex)}
                        className="remove-tool-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="tool-basic-info">
                    <input
                      type="text"
                      placeholder="Tool Name"
                      value={entry.toolName}
                      onChange={(e) =>
                        updateToolEntry(entryIndex, "toolName", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Tool Description"
                      value={entry.toolDescription}
                      onChange={(e) =>
                        updateToolEntry(
                          entryIndex,
                          "toolDescription",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="fields-container">
                    {entry.fieldRows.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="field-definition">
                        <input
                          type="text"
                          placeholder="Field Name"
                          value={field.name}
                          onChange={(e) =>
                            updateFieldRow(
                              entryIndex,
                              fieldIndex,
                              "name",
                              e.target.value
                            )
                          }
                        />
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateFieldRow(
                              entryIndex,
                              fieldIndex,
                              "type",
                              e.target.value
                            )
                          }
                        >
                          <option value="int">Integer</option>
                          <option value="str">String</option>
                          <option value="float">Float</option>
                          <option value="bool">Boolean</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Field Description"
                          value={field.description}
                          onChange={(e) =>
                            updateFieldRow(
                              entryIndex,
                              fieldIndex,
                              "description",
                              e.target.value
                            )
                          }
                        />
                        <div className="field-actions">
                          <button
                            onClick={() => addFieldRow(entryIndex)}
                            className="add-field-btn"
                            title="Add new field"
                          >
                            <PlusCircle size={18} />
                          </button>
                          {fieldIndex > 0 && (
                            <button
                              onClick={() =>
                                removeFieldRow(entryIndex, fieldIndex)
                              }
                              className="remove-field-btn"
                              title="Remove field"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={addTools} className="add-tool-btn">
                Add Tools
              </button>
            </div>
            {tools?.length > 0 && (
              <div className="defined-tools">
                <h2>Defined Tools</h2>
                <div className="tools-list">
                  {tools.map((tool) => (
                    <div key={tool._id} className="tool-item">
                      <h3>{tool.name}</h3>
                      <p className="tool-description">{tool.description}</p>
                      <div className="tool-fields">
                        {tool.fields &&
                          Object.entries(tool.fields).map(
                            ([fieldName, fieldInfo]) => (
                              <div key={fieldInfo._id} className="tool-field">
                                <strong>{fieldName}</strong>:{" "}
                                {fieldInfo.field_type} - {fieldInfo.description}
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="query-form">
              <input
                type="text"
                placeholder="Enter your query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <Loader2 className="loading-icon" /> : <Send />}
              </button>
            </form>

            {error && (
              <div className="error-message">
                <AlertCircle />
                <p>{error}</p>
              </div>
            )}

            {response && (
              <div className="response">
                <h2>
                  <Terminal />
                  <span>Response</span>
                </h2>
                <div className="tool-calls">
                  {response.map((tool, index) => (
                    <div key={index} className="tool-call">
                      <h3 className="tool-name">{tool.name}</h3>
                      <div className="tool-arguments">
                        <h4>Arguments:</h4>
                        <ul>
                          {Object.entries(tool.args).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value.toString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
