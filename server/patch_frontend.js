const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../client/src/hr-portal/pages/EmployeeSalarySlips.jsx');
const destPath = path.join(__dirname, '../client/src/pages/hr/SalarySlips.jsx');

const srcContent = fs.readFileSync(srcPath, 'utf8');
const destContent = fs.readFileSync(destPath, 'utf8');

// Extract the Detail Modal from src
const srcStartMarker = '{/* Detail Modal */}';
const srcStartIndex = srcContent.indexOf(srcStartMarker);
const srcEndMarker = '</AnimatePresence>';
const srcEndIndex = srcContent.indexOf(srcEndMarker, srcStartIndex) + srcEndMarker.length;

const modalBlock = srcContent.substring(srcStartIndex, srcEndIndex);

// Replace in dest
const destStartIndex = destContent.indexOf(srcStartMarker);
const destEndIndex = destContent.indexOf(srcEndMarker, destStartIndex) + srcEndMarker.length;

const newDestContent = destContent.substring(0, destStartIndex) + modalBlock + destContent.substring(destEndIndex);

fs.writeFileSync(destPath, newDestContent, 'utf8');
console.log('Successfully synchronized the Modal UI!');
