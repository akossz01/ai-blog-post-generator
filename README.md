# Blog Generator

This is a simple blog generator tool that generates a blog post based on user input and related Reddit posts. It utilizes the OpenAI API for generating blog content and Axios for fetching data from Reddit and Freepik.

## Getting Started

To use this blog generator, follow these steps:

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/akossz01/ai-blog-post-generator.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ai-blog-post-generator
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    - Create a `.env` file in the root directory.
    - Add your OpenAI API key and Freepik API key to the `.env` file:

        ```dotenv
        OPENAI_API_KEY=your-openai-api-key
        FREEPIK_API_KEY=your-freepik-api-key
        ```

5. Run the generator:

    ```bash
    node index.js
    ```

6. Follow the prompts to enter the blog title and prompt.

7. Once the blog is generated, an HTML file named `blog.html` will be created in the project directory.

## Dependencies

- Node.js
- npm
- Axios
- OpenAI API
- Freepik API
- ora
- dotenv
- marked

## Configuration

- You can configure the number of Reddit posts and comments to fetch in the `conf.js` file.

## Usage

- This blog generator fetches related Reddit posts based on user input keywords, then uses the OpenAI API to generate blog content inspired by those posts.
- Images are inserted into the blog content using placeholders in the format `[Image: description]`, and the generator replaces these placeholders with relevant images fetched from Freepik.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
