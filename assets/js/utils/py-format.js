function formatPython(inputText) {
    const lines = inputText.split('\n');

    // Remove empty lines from the beginning and end
    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
    }

    // Calculate the number of leading whitespaces in the first non-empty line
    let leadingWhitespaceCount = 0;
    for (const char of lines.find(line => line.trim() !== '')) {
        if (char === ' ') {
            leadingWhitespaceCount++;
        } else {
            break;
        }
    }

    // Remove whitespaces from the beginning of each line
    const processedLines = lines.map(line => {
        // Remove exactly leadingWhitespaceCount whitespaces or as many as possible
        return line.replace(new RegExp(`^\\s{0,${leadingWhitespaceCount}}`), '');
    });

    const processedText = processedLines.join('\n');

    return processedText;
}

export { formatPython };