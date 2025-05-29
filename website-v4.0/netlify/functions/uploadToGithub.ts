import { Handler } from '@netlify/functions';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

// Load environment variables from .env if available (for local dev only)
dotenv.config();

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { folder, filename, content, message } = JSON.parse(event.body || '{}');

    if (!folder || !filename || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const path = `${folder}/${filename}`;
    console.log('Uploading to path:', path);

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.error('GITHUB_TOKEN is undefined.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GitHub token in environment' }),
      };
    }

    const octokit = new Octokit({ auth: githubToken });

    let sha: string | undefined;

    try {
      const { data } = await octokit.repos.getContent({
        owner: 'solomonschwartz',
        repo: 'solomon-schwartz-website',
        path,
      });

      if (!Array.isArray(data) && data.sha) {
        sha = data.sha;
        console.log(`Existing file found with sha: ${sha}`);
      }
    } catch (err: any) {
      if (err.status === 404) {
        console.log('No existing file found; creating new.');
      } else {
        console.error('Error checking file existence:', err);
        throw err;
      }
    }

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: 'solomonschwartz',
      repo: 'solomon-schwartz-website',
      path,
      message: message || `Update ${path}`,
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: 'Solomon Schwartz',
        email: 'solomon@example.com',
      },
      sha,
      branch: 'main',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        html_url: response.data.content?.html_url || '',
      }),
    };
  } catch (err: any) {
    console.error('Upload failed:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

export { handler };
