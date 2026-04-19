import fastifyPlugin from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'path';


export default fastifyPlugin(async (app) => {
	const repoRoot = path.resolve(process.cwd(), '..');
	const clientRoot = path.join(repoRoot, 'dist', 'client');

	await app.register(fastifyStatic, {
		root: clientRoot,
		prefix: '/',
	});

	app.setNotFoundHandler((request, reply) => {
		const acceptsHtml = request.method === 'GET' && (request.headers.accept ?? '').includes('text/html');

		if (acceptsHtml && !request.url.startsWith('/api/') && !request.url.startsWith('/static/')) {
			return reply.sendFile('index.html');
		}

		return reply.code(404).send({ message: 'Not Found' });
	});
});