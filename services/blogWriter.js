import { promises as fs } from "fs";
import axios from "axios";
import * as openai from "openai";
import { marked } from "marked";
import dotenv from "dotenv";
import ora from "ora";

dotenv.config();

import {
  keywordExtractPrompt,
  blogPrompt,
  postsToFetch,
  commentsToFetch,
  postAge
} from "./../conf.js";

const openaiKey = process.env.OPENAI_API_KEY;
const openaiClient = new openai.OpenAI(openaiKey);

async function extractKeywords(prompt) {
  try {
    const spinner = ora("Extracting keywords..").start();

    const conversationPrompt = `${keywordExtractPrompt}\nUser: ${prompt}`;

    const completion = await openaiClient.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: conversationPrompt,
      max_tokens: 256,
      temperature: 0.7,
      stop: ["\nUser:"],
      echo: false,
    });

    const response = completion.choices[0].text.trim();

    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);
    spinner.succeed("Keywords extracted successfully!");

    return response;
  } catch (error) {
    spinner.fail("Error extracting keywords!");
    // console.error("Error extracting keywords:", error);
    return [];
  }
}

async function fetchRedditPosts(keywords) {
  try {
    const spinner = ora("Fetching Reddit posts...").start();

    const response = await axios.get(
      `https://www.reddit.com/search.json?q=${keywords}&sort=relevance&limit=${postsToFetch}&t=${postAge}`
    );

    let redditPosts = response.data.data.children;
    let formattedPosts = [];

    for (let post of redditPosts) {
      const {
        title,
        selftext,
        permalink,
        subreddit_name_prefixed,
        thumbnail,
        created_utc,
      } = post.data;
      let comments = Array(5).fill("No comments available");

      if (permalink) {
        const postResponse = await axios.get(
          `https://www.reddit.com${permalink}.json?limit=${commentsToFetch}`
        );
        comments = postResponse.data[1].data.children.map(
          (comment) => comment.data.body
        );
        comments = comments.length > 0 ? comments : ["No comments available"];
      }

      formattedPosts.push({
        title,
        content: selftext || "No content available",
        comments,
        subreddit_name_prefixed,
        thumbnail,
        permalink,
        created_utc,
      });
    }

    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);
    spinner.succeed("Reddit posts fetched successfully!");

    return formattedPosts;
  } catch (error) {
    spinner.fail("Error fetching Reddit posts!");
    // console.error("Error fetching Reddit posts:", error);
    return [];
  }
}

async function writeBlogPost(
  blogTitle,
  userPrompt,
  keywordsArray,
  redditPostsArray
) {
  const spinner = ora("Generating blog post content...").start();

  try {
    let prompt = `${blogPrompt}\nCreate a blog post about: ${userPrompt} with title: "${blogTitle}"\nImportant keywords that the blog post is about: ${keywordsArray.join(
      ", "
    )}\n Reddit Posts and comments you can get inspiration from for the blog post: \n`;

    for (let post of redditPostsArray) {
      prompt += `Post Title: ${post.title}\n`;
      prompt += `Post Content: ${post.content}\n`;
      prompt += `Post Comments: ${post.comments.join("\n")}\n`;
    }

    prompt += "Insert images where needed in the following format: [Image: description]. Always use atleast one image in the blog post.";

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    });

    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);
    const generatedBlogPost = completion.choices[0].message.content.trim();

    spinner.succeed("Blog post generated successfully!"); 
    return generatedBlogPost;
  } catch (error) {
    spinner.fail("Error generating blog post!"); 
    // console.error("Error generating blog post:", error);
  }
}

async function createHTMLFile(title, thumbnailURL, htmlContent) {
  const spinner = ora("Creating HTML file...").start();

  try {
    const template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generated Blog Post</title>
            <style>
                html {
                    font-family: 'Roboto', sans-serif;
                    scroll-behavior: smooth;
                    -webkit-tap-highlight-color: transparent;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                h1, h2, h3 {
                    color: black;
                }
                h1 {
                    font-size: 2.5rem;

                }
                h2 {
                    font-size: 2rem;
                }
                h3 {
                    font-size: 1.5rem;
                }
                .main-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: justify;
                }
                .title {
                    text-align: center;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="main-container">
                <h1 class="title">${title}</h1>
                <div class="thumbnail">
                    <img src="${thumbnailURL}" alt="Thumbnail">
                </div>
                <div class="blog-post">
                    ${htmlContent}
                </div
            </div>
        </body>
        </html>`;

    const fileName = `blog.html`;
    await fs.writeFile(fileName, template);
    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);
    spinner.succeed(`HTML file '${fileName}' created successfully!`); 
  } catch (error) {
    spinner.fail("Error creating HTML file!"); 
    // console.error("Error creating HTML file:", error);
  }
}

async function replaceImagePlaceholders(blogContent) {
  const spinner = ora("Replacing image placeholders...").start();

  try {
    const regex = /\[Image:\s*(.*?)\]/g;
    let replacedContent = blogContent;

    const matches = [...blogContent.matchAll(regex)];

    for (const match of matches) {
      const searchTerm = match[0].replace(/\[Image: |\]/g, "").trim().replace(/\s+/g, "+");
      const apiKey = process.env.FREEPIK_API_KEY;
      const apiUrl = `https://api.freepik.com/v1/resources?locale=en-US&page=1&limit=1&order=latest&term=${searchTerm}`;
      const headers = {
        "Accept-Language": "en-gb",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Freepik-API-Key": apiKey
      };

      const response = await axios.get(apiUrl, { headers });

      if (response.data.data.length > 0) {
        const imageUrl = response.data.data[0].image.source.url;
        replacedContent = replacedContent.replace(match[0], `<img src="${imageUrl}" alt="${searchTerm}">`);
      }
    }

    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);

    spinner.succeed("Image placeholders replaced successfully!"); 
    return replacedContent;
  } catch (error) {
    spinner.fail("Error replacing image placeholders!"); 
    // console.error("Error replacing image placeholders:", error);
    return blogContent;
  }
}

async function getThumbnail(blogTitle, keywords) {
    try {
      const searchTerm = encodeURIComponent(blogTitle + ' ' + keywords);
      const apiKey = process.env.FREEPIK_API_KEY;
      const apiUrl = `https://api.freepik.com/v1/resources?locale=en-US&page=1&limit=1&order=latest&term=${searchTerm}`;
      const headers = {
        "Accept-Language": "en-gb",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Freepik-API-Key": apiKey
      };
  
      const response = await axios.get(apiUrl, { headers });
  
      if (response.data.data.length > 0) {
        return response.data.data[0].image.source.url;
      } else {
        console.error("No image found for the given blog title and keywords.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
      return null;
    }
  }

async function newBlogPost(blogTitle, userPrompt) {
  const spinner = ora("Creating new blog post...").start();

  try {
    const extractedKeywords = await extractKeywords(userPrompt);
    const keywordArray = extractedKeywords
      .split(",")
      .map((keyword) => keyword.trim());

    const thumbnailURL = await getThumbnail(blogTitle, keywordArray.join(" "));

    const redditPosts = await fetchRedditPosts(keywordArray.join(" "));

    for (let post of redditPosts) {
        console.log(`${post.title}` + ' : ' + `https://www.reddit.com${post.permalink}`);
    }

    const blogContent = await writeBlogPost(
      blogTitle,
      userPrompt,
      keywordArray,
      redditPosts
    );

    const replacedContent = await replaceImagePlaceholders(blogContent);

    const htmlContent = marked(replacedContent);

    await createHTMLFile(blogTitle, thumbnailURL, htmlContent);

    // Fake delay to make the spinner visible
    setTimeout(() => {}, 1500);

    spinner.succeed("Blog post created successfully!"); 
  } catch (error) {
    spinner.fail("Error creating new blog post!"); 
    // console.error("Error creating new blog post:", error);
  }
}

export {
  fetchRedditPosts,
  extractKeywords,
  writeBlogPost,
  newBlogPost,
};
