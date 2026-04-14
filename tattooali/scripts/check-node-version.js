#!/usr/bin/env node
/**
 * Falha cedo com mensagem clara se o Node for velho demais para o Expo CLI (??, etc.).
 */
const major = Number.parseInt(process.versions.node.split('.')[0], 10);
const min = 18;
if (!Number.isFinite(major) || major < min) {
  console.error('');
  console.error('  Este app usa Expo 54 e precisa de Node.js ' + min + ' ou superior.');
  console.error('  Sua versão: ' + process.version);
  console.error('');
  console.error('  Com nvm:    nvm install 20 && nvm use 20');
  console.error('  Depois:     cd tattooali && npm start');
  console.error('');
  process.exit(1);
}
