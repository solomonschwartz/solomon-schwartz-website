import { Handler } from '@netlify/functions';
import { Octokit } from '@octokit/rest';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, body: 'Missing GitHub token' };
  }

  const { folder, filename, content } = JSON.parse(event.body || '{}');

  const octokit = new Octokit({ auth: token });

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: 'solomonschwartz',
      repo: 'solomon-schwartz-website',
      path: `${folder}/${filename}`,
      message: `Add ${filename}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: 'main',
    });

    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('GitHub upload failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub upload failed', details: error }),
    };
  }
};

export { handler };
