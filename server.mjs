import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const root = path.dirname( fileURLToPath( import.meta.url ) );
const port = process.argv[ 2 ] ? Number( process.argv[ 2 ] ) : 8081;

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.wasm': 'application/wasm',
	'.glb': 'model/gltf-binary',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.json': 'application/json'
};

const server = http.createServer( ( req, res ) => {

	const urlPath = decodeURIComponent( new URL( req.url, 'http://localhost' ).pathname );
	let filePath = path.normalize( path.join( root, urlPath ) );

	if ( ! filePath.startsWith( root ) ) {
		res.writeHead( 403 );
		res.end( 'Forbidden' );
		return;
	}

	if ( fs.existsSync( filePath ) && fs.statSync( filePath ).isDirectory() ) {
		filePath = path.join( filePath, 'index.html' );
	}

	fs.readFile( filePath, ( err, data ) => {

		if ( err ) {
			res.writeHead( 404 );
			res.end( 'Not found' );
			return;
		}

		res.writeHead( 200, { 'Content-Type': MIME[ path.extname( filePath ) ] || 'application/octet-stream' } );
		res.end( data );

	} );

} );

server.listen( port, '127.0.0.1', () => {

	const url = 'http://127.0.0.1:' + port;
	console.log( 'Bicicleta 3D en ' + url );
	exec( 'start "" ' + url );

} );

server.on( 'error', () => {

	console.log( 'Puerto ' + port + ' ocupado, usando 8082...' );
	server.listen( 8082, '127.0.0.1', () => {

		const url = 'http://127.0.0.1:8082';
		console.log( 'Bicicleta 3D en ' + url );
		exec( 'start "" ' + url );

	} );

} );
