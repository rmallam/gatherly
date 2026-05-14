const fs = require('fs');

const path = 'frontend/src/components/expenses/AddExpenseModal.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Initial State for receiptUrl and isEditing
code = code.replace(
    /amount: initialData\?\.amount \|\| '',/,
    `id: initialData?.id || null,
        amount: initialData?.amount || '',`
);
code = code.replace(
    /splitType: 'equal'/,
    `splitType: initialData?.splitType || 'equal',
        receiptUrl: initialData?.receipt_url || ''`
);

// 2. Add isEditing derived from formData.id
// And modify the submit to PUT instead of POST if isEditing is true
code = code.replace(
    /const token = localStorage.getItem\('token'\);\n            const payload = {/,
    `const isEditing = !!formData.id;
            const token = localStorage.getItem('token');
            const payload = {`
);

code = code.replace(
    /const response = await fetch\(\`\$\{API_URL\}\/events\/\$\{eventId\}\/expenses\`, {/,
    `const url = isEditing 
                ? \`\${API_URL}/events/\${eventId}/expenses/\${formData.id}\`
                : \`\${API_URL}/events/\${eventId}/expenses\`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {`
);
code = code.replace(
    /method: 'POST',/,
    `method: method,`
);

// 3. Receipt Upload Logic inside handleFileSelect
code = code.replace(
    /const response = await fetch\(\`\$\{API_URL\}\/gemini\/analyze-receipt\`, {/g,
    `// First upload the image to Cloudinary
                    try {
                        const uploadResponse = await fetch(\`\${API_URL}/upload/image\`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${token}\`
                            },
                            body: JSON.stringify({ image: \`data:\${mimeType};base64,\${base64Image}\` })
                        });
                        if (uploadResponse.ok) {
                            const uploadData = await uploadResponse.json();
                            setFormData(prev => ({ ...prev, receiptUrl: uploadData.url }));
                        }
                    } catch (uploadErr) {
                        console.error('Failed to upload receipt image:', uploadErr);
                    }

                    const response = await fetch(\`\${API_URL}/gemini/analyze-receipt\`, {`
);

// 4. Update Split Types logic
// In handleAssignLineItem, change splitType to 'itemized'
code = code.replace(
    /setFormData\(prev => \(\{ \.\.\.prev, splitType: 'custom' \}\)\);/g,
    `setFormData(prev => ({ ...prev, splitType: 'itemized' }));`
);

// Add radio buttons for itemized
const radioButtonsRegex = /<div style={{ display: 'flex', gap: '1rem' }}>[\s\S]*?<\/div>/;
const newRadioButtons = `<div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="equal"
                                    checked={formData.splitType === 'equal'}
                                    onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                                />
                                <span style={{ color: 'var(--text-primary)' }}>Equal Split</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="custom"
                                    checked={formData.splitType === 'custom'}
                                    onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                                />
                                <span style={{ color: 'var(--text-primary)' }}>Custom Split</span>
                            </label>
                            {lineItems.length > 0 && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="splitType"
                                        value="itemized"
                                        checked={formData.splitType === 'itemized'}
                                        onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                                    />
                                    <span style={{ color: 'var(--text-primary)' }}>Itemized</span>
                                </label>
                            )}
                        </div>`;
code = code.replace(radioButtonsRegex, newRadioButtons);

// Show AI Scan-to-Split View only if splitType is 'itemized'
code = code.replace(
    /\{lineItems\.length > 0 && \(/,
    `{lineItems.length > 0 && formData.splitType === 'itemized' && (`
);

// Fix the useEffect for customSplits to calculate for 'itemized' not 'custom'
code = code.replace(
    /if \(lineItems\.length > 0 && formData\.splitType === 'custom'\) \{/,
    `if (lineItems.length > 0 && formData.splitType === 'itemized') {`
);

// Fix handleSubmit to use customSplits for both custom and itemized
code = code.replace(
    /\} else \{[\s]*\/\/ Custom splits/g,
    `} else {
                // Custom or Itemized splits`
);

fs.writeFileSync(path, code);
