export default {
  points: {
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;

      varying vec3 vColor;

      void main() {

        vColor = customColor;

        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_PointSize = size * ( 300.0 / -mvPosition.z );

        gl_Position = projectionMatrix * mvPosition;

      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform sampler2D texture;

      varying vec3 vColor;

      void main() {

        gl_FragColor = vec4( color * vColor, 1.0 );

        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );

        gl_FragColor.a *= 0.5;

        if ( gl_FragColor.a < ALPHATEST ) discard;

      }
    `
  }
}
