module.exports = [
        {
          type: "function",
          function: {
            name: "calculate",
            description:
              "Evaluate a mathematical expression or compare numbers. CRITICAL: You MUST use this tool for ANY math calculations or number comparisons (e.g. '9.9 > 9.11'). DO NOT wrap your equations in solve() or any other function, just pass the raw equation. You MUST blindly trust the result returned by this tool and formulate your answer entirely based on it, ignoring any of your own contradictory intuition.",
            parameters: {
              type: "object",
              properties: {
                expression: {
                  type: "string",
                  description: "The math expression (e.g., '9.9 - 9.11')",
                },
              },
              required: ["expression"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "execute_python",
            description:
              "Execute Python code in a stateful browser environment. Use this to perform complex math, data analysis, or complex logic. Use `print()` to output results.",
            parameters: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "The Python code to execute",
                },
              },
              required: ["code"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "generate_image",
            description:
              "Generate an image based on a prompt. Use this when the user asks to draw, paint, or generate a picture. The tool returns a markdown image tag. You MUST output this markdown image tag directly to the user.",
            parameters: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description:
                    "A detailed description of the image to generate",
                },
              },
              required: ["prompt"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_weather",
            description:
              "Get the current weather for a specific location. Use this when the user asks for weather conditions.",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description:
                    "The city or location name, e.g. 'Beijing' or 'New York'",
                },
              },
              required: ["location"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_market_data",
            description:
              "Get the current price of a cryptocurrency or stock in USD. Use this when the user asks for market data or prices.",
            parameters: {
              type: "object",
              properties: {
                symbol: {
                  type: "string",
                  description:
                    "The symbol or ID of the asset, e.g. 'bitcoin', 'ethereum', 'aapl'",
                },
              },
              required: ["symbol"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "render_diagram",
            description:
              "Render a diagram using Mermaid.js syntax. Use this when the user asks for flowcharts, sequence diagrams, mindmaps, or any architectural diagrams. The tool will return HTML that you must directly output.",
            parameters: {
              type: "object",
              properties: {
                mermaid_code: {
                  type: "string",
                  description:
                    "The raw Mermaid.js syntax code without markdown blocks",
                },
              },
              required: ["mermaid_code"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_dictionary",
            description:
              "Look up a word in the English dictionary. Use this to get definitions, synonyms, and phonetics.",
            parameters: {
              type: "object",
              properties: {
                word: {
                  type: "string",
                  description: "The english word to look up",
                },
              },
              required: ["word"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_country_info",
            description:
              "Get facts and information about a specific country. Use this to find out population, capital, borders, flags, etc.",
            parameters: {
              type: "object",
              properties: {
                country_name: {
                  type: "string",
                  description:
                    "The english name of the country, e.g. 'china', 'france'",
                },
              },
              required: ["country_name"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_tech_news",
            description:
              "Fetch the top trending technology stories from HackerNews. Use this when the user asks for tech news or what is happening in tech today.",
            parameters: { type: "object", properties: {}, required: [] },
          },
        },
        {
          type: "function",
          function: {
            name: "get_spacex_launches",
            description: "Get information about the latest SpaceX launch.",
            parameters: { type: "object", properties: {}, required: [] },
          },
        },
        {
          type: "function",
          function: {
            name: "play_trivia_game",
            description:
              "Get a random trivia question. Use this when the user wants to play a game or answer a trivia question.",
            parameters: { type: "object", properties: {}, required: [] },
          },
        },
        {
          type: "function",
          function: {
            name: "tell_a_joke",
            description:
              "Get a random joke. Use this to tell a joke to the user.",
            parameters: { type: "object", properties: {}, required: [] },
          },
        },
        {
          type: "function",
          function: {
            name: "predict_name_attributes",
            description:
              "Predict the age, gender, and nationality based on a person's first name using global statistics.",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The first name to predict attributes for",
                },
              },
              required: ["name"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "generate_qr_code",
            description:
              "Generate a QR code for a given URL or text string. The tool returns a markdown image tag. You MUST output this markdown image tag directly to the user.",
            parameters: {
              type: "object",
              properties: {
                data: {
                  type: "string",
                  description: "The data or URL to encode in the QR code",
                },
              },
              required: ["data"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "search_free_apis",
            description:
              "Search a local database of 190+ free public APIs by keyword. Use this when the user asks for random data (like animals, anime, crypto, random facts, jokes). It returns a list of API URLs and descriptions.",
            parameters: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description:
                    "The keyword to search for (e.g. 'cat', 'crypto', 'anime')",
                },
              },
              required: ["keyword"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "fetch_public_api",
            description:
              "Make a generic GET request to a public API URL. Use this to fetch data from URLs found via search_free_apis.",
            parameters: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The API endpoint URL to fetch",
                },
              },
              required: ["url"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "manage_memory",
            description: "Store or retrieve long-term memory for the user using browser localStorage.",
            parameters: {
              type: "object",
              properties: {
                action: { type: "string", enum: ["save", "load"], description: "Whether to save or load memory" },
                key: { type: "string", description: "The key to store or retrieve" },
                value: { type: "string", description: "The value to store (only required for save action)" }
              },
              required: ["action", "key"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "control_ui",
            description: "Control the user interface of the Neural Core chat application.",
            parameters: {
              type: "object",
              properties: {
                action: { type: "string", enum: ["toggle_theme"], description: "The UI action to perform" }
              },
              required: ["action"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_downloadable_file",
            description: "Generate a file for the user to download and optionally open the canvas panel.",
            parameters: {
              type: "object",
              properties: {
                filename: { type: "string", description: "The name of the file to create (e.g. data.csv, report.md)" },
                content: { type: "string", description: "The text content of the file" },
                open_canvas: { type: "boolean", description: "If true, also triggers the canvas panel to open" }
              },
              required: ["filename", "content"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "launch_ar_view",
            description: "Attempt to launch an immersive WebXR AR session on compatible devices.",
            parameters: {
              type: "object",
              properties: {
                model_type: { type: "string", description: "Description of what to show in AR" }
              },
              required: ["model_type"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "control_other_tabs",
            description: "Interact with other browser tabs. Requires a companion browser extension to be installed.",
            parameters: {
              type: "object",
              properties: {
                action: { type: "string", enum: ["close_tab", "focus_tab", "extract_content"], description: "The action to perform on another tab" },
                url_pattern: { type: "string", description: "A URL keyword or pattern to match the target tab (e.g. 'github.com')" }
              },
              required: ["action", "url_pattern"]
            }
          }
        }
      ];