import { Handler } from '@netlify/functions';
import { Octokit } from '@octokit/rest';

const handler: Handler = async (event) => {
  try {
    const { folder, filename, content, message } = JSON.parse(event.body || '{}');

    if (!folder || !filename || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const path = `${folder}/${filename}`;

    // Declare sha as a mutable variable
    let sha: string | undefined = undefined;

    try {
      const response = await octokit.repos.getContent({
        owner: 'solomonschwartz',
        repo: 'solomon-schwartz-website',
        path,
      });

      if (!Array.isArray(response.data) && 'sha' in response.data) {
        sha = response.data.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error;
      }
      // If file not found (404), that's fine — we'll create a new file
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: 'solomonschwartz',
      repo: 'solomon-schwartz-website',
      path,
      message: message || `Upload ${filename}`,
      content: Buffer.from(content).toString('base64'),
      sha, // If sha is undefined, GitHub creates the file
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' }),
    };
  }
};

export { handler };
