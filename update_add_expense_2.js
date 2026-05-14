const fs = require('fs');
const path = 'frontend/src/components/expenses/AddExpenseModal.jsx';
let code = fs.readFileSync(path, 'utf8');

// Replace loading state
code = code.replace(
    /const \[loading, setLoading\] = useState\(false\);/,
    `const [loadingState, setLoadingState] = useState('');`
);

// Update setLoading usage in handleFileSelect
code = code.replace(
    /setLoading\(true\);/,
    `setLoadingState('uploading');`
);
code = code.replace(
    /setLoading\(false\);/g,
    `setLoadingState('');`
);

code = code.replace(
    /const response = await fetch\(\`\$\{API_URL\}\/gemini\/analyze-receipt\`, {/,
    `setLoadingState('analyzing');
                    const response = await fetch(\`\${API_URL}/gemini/analyze-receipt\`, {`
);

// Update setLoading usage in handleSubmit
code = code.replace(
    /setLoading\(true\);[\s\S]*?try \{/,
    `setLoadingState('saving');
        try {`
);

// Update button text
const buttonTextRegex = /\{loading \? 'Saving\.\.\.' : \(formData\.id \? 'Save Changes' : 'Add Expense'\)\}/;
code = code.replace(buttonTextRegex, 
    `{loadingState === 'saving' ? 'Saving...' : (formData.id ? 'Save Changes' : 'Add Expense')}`
);
// Update AI scanning UI
code = code.replace(
    /\{loading \? \([\s\S]*?\} : \(/,
    `{loadingState === 'uploading' || loadingState === 'analyzing' ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {loadingState === 'uploading' ? 'Uploading receipt securely...' : 'AI is analyzing your receipt...'}
                            </p>
                        </div>
                    ) : (`
);

// Segmented Control UI
const splitTypeSectionRegex = /<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const segmentedControlUI = `<div style={{ 
                            display: 'flex', 
                            background: 'var(--bg-secondary)', 
                            borderRadius: '12px', 
                            padding: '4px',
                            gap: '4px'
                        }}>
                            {['equal', 'custom', ...(lineItems.length > 0 ? ['itemized'] : [])].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, splitType: type })}
                                    style={{
                                        flex: 1,
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: formData.splitType === type ? 'var(--bg-primary)' : 'transparent',
                                        color: formData.splitType === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: formData.splitType === type ? 600 : 500,
                                        boxShadow: formData.splitType === type ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {type} {type !== 'itemized' && 'Split'}
                                </button>
                            ))}
                        </div>
                    </div>`;
code = code.replace(splitTypeSectionRegex, segmentedControlUI);

// Update disabled checks
code = code.replace(/disabled=\{loading\}/g, `disabled={!!loadingState}`);

fs.writeFileSync(path, code);
