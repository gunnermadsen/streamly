const concat = (buffer1, buffer2) => {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

  return tmp.buffer;
};

const appendBuffer = (buffer1, buffer2, context) => {
  const numberOfChannels = Math.min( buffer1.numberOfChannels, buffer2.numberOfChannels );
  const tmp = context.createBuffer( numberOfChannels, (buffer1.length + buffer2.length), buffer1.sampleRate );
  for (let i=0; i<numberOfChannels; i++) {
    const channel = tmp.getChannelData(i);
    channel.set( buffer1.getChannelData(i), 0);
    channel.set( buffer2.getChannelData(i), buffer1.length);
  }
  return tmp;
};


/**
 * @link please see https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header for mp3 header information
 * @param {*} data 
 * @param {*} numberOfChannels 
 * @param {*} sampleRate 
 */

const withWaveHeader = (data, numberOfChannels, sampleRate) => {
  const header = new ArrayBuffer(44);

  const d = new DataView(header);

  // Chunk id
  d.setUint8(0, "R".charCodeAt(0));
  d.setUint8(1, "I".charCodeAt(0));
  d.setUint8(2, "F".charCodeAt(0));
  d.setUint8(3, "F".charCodeAt(0));

  // Chunk length
  d.setUint32(4, data.byteLength / 2 + 44, true);

  // Format
  d.setUint8(8, "W".charCodeAt(0));
  d.setUint8(9, "A".charCodeAt(0));
  d.setUint8(10, "V".charCodeAt(0));
  d.setUint8(11, "E".charCodeAt(0));

  // Sub Chunk 1 ID
  d.setUint8(12, "f".charCodeAt(0));
  d.setUint8(13, "m".charCodeAt(0));
  d.setUint8(14, "t".charCodeAt(0));
  d.setUint8(15, " ".charCodeAt(0));

  // Sub chunk 1 size
  d.setUint32(16, 16, true);

  // Audio format
  d.setUint16(20, 1, true);

  // Number of channels
  d.setUint16(22, numberOfChannels, true);

  // Sample rate
  d.setUint32(24, sampleRate, true);

  // ByteRate rate
  d.setUint32(28, sampleRate * 1 * 2);

  // Block Align
  d.setUint16(32, numberOfChannels * 2);

  // Blocks per sample
  d.setUint16(34, 16, true);

  // Sub chunk 2 ID
  d.setUint8(36, "d".charCodeAt(0));
  d.setUint8(37, "a".charCodeAt(0));
  d.setUint8(38, "t".charCodeAt(0));
  d.setUint8(39, "a".charCodeAt(0));

  // Sub Chunk 2 Size
  d.setUint32(40, data.byteLength, true);

  return concat(header, data);
};

export { withWaveHeader, appendBuffer };