import React, { useState, useEffect } from 'react';
import { FiPlay, FiPlus, FiTrash2, FiEdit3, FiFileText, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CodeInput = ({ socketRef, roomId, code, language, username, onExecute }) => {
    const [inputs, setInputs] = useState([]);
    const [showInputModal, setShowInputModal] = useState(false);
    const [executionMode, setExecutionMode] = useState('no-input');
    const [inputHistory, setInputHistory] = useState([]);

    const addInput = () => {
        setInputs([...inputs, { 
            id: Date.now(), 
            label: `Input ${inputs.length + 1}`, 
            value: '', 
            type: 'text' 
        }]);
    };

    const removeInput = (id) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    const updateInput = (id, field, value) => {
        setInputs(inputs.map(input => 
            input.id === id ? { ...input, [field]: value } : input
        ));
    };

    const executeWithInputs = () => {
        if (executionMode === 'with-input' && inputs.length === 0) {
            toast.error('Please add at least one input or change execution mode');
            return;
        }

        const inputData = {
            mode: executionMode,
            inputs: inputs.map(input => ({
                label: input.label,
                value: input.value,
                type: input.type
            }))
        };

        if (inputs.length > 0) {
            const historyEntry = {
                timestamp: new Date().toISOString(),
                inputs: [...inputs],
                language,
                codeSnippet: code.substring(0, 100) + (code.length > 100 ? '...' : '')
            };
            setInputHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
        }

        onExecute(inputData);
        setShowInputModal(false);
    };

    const generateSampleInputs = () => {
        const samples = {
            javascript: [
                { label: 'Name', value: 'John Doe', type: 'text' },
                { label: 'Age', value: '25', type: 'number' }
            ],
            python: [
                { label: 'Number 1', value: '10', type: 'number' },
                { label: 'Number 2', value: '20', type: 'number' }
            ],
            cpp: [
                { label: 'Array Size', value: '5', type: 'number' },
                { label: 'Elements', value: '1 2 3 4 5', type: 'text' }
            ]
        };
        
        const sampleInputs = samples[language] || samples.javascript;
        setInputs(sampleInputs.map((input, index) => ({ ...input, id: Date.now() + index })));
        toast.success('Sample inputs generated');
    };

    return (
        <div className="code-input-container">
            <div className="execution-mode-selector">
                <label className="mode-label">Execution Mode:</label>
                <div className="mode-options">
                    <button
                        className={`mode-btn ${executionMode === 'no-input' ? 'active' : ''}`}
                        onClick={() => setExecutionMode('no-input')}
                    >
                        <FiPlay size={14} />
                        Direct Run
                    </button>
                    <button
                        className={`mode-btn ${executionMode === 'with-input' ? 'active' : ''}`}
                        onClick={() => setExecutionMode('with-input')}
                    >
                        <FiFileText size={14} />
                        With Inputs
                    </button>
                </div>
            </div>

            <div className="execute-section">
                {executionMode === 'no-input' ? (
                    <button
                        onClick={() => onExecute({ mode: 'no-input', inputs: [] })}
                        className="execute-btn primary"
                    >
                        <FiPlay size={16} />
                        Run Code
                    </button>
                ) : (
                    <button
                        onClick={() => setShowInputModal(true)}
                        className="execute-btn primary"
                    >
                        <FiFileText size={16} />
                        Configure & Run ({inputs.length} inputs)
                    </button>
                )}
            </div>

            {showInputModal && (
                <div className="modal-overlay" onClick={() => setShowInputModal(false)}>
                    <div className="input-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Configure Program Inputs</h3>
                            <div className="header-actions">
                                <button onClick={generateSampleInputs} className="sample-btn">
                                    Generate Sample
                                </button>
                                <button onClick={() => setShowInputModal(false)} className="close-btn">
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="inputs-section">
                                <div className="section-header">
                                    <h4>Program Inputs</h4>
                                    <button onClick={addInput} className="add-input-btn">
                                        <FiPlus size={14} />
                                        Add Input
                                    </button>
                                </div>

                                <div className="inputs-list">
                                    {inputs.length === 0 ? (
                                        <div className="empty-inputs">
                                            <FiFileText size={32} />
                                            <p>No inputs configured</p>
                                            <button onClick={addInput} className="add-first-input">
                                                Add First Input
                                            </button>
                                        </div>
                                    ) : (
                                        inputs.map((input) => (
                                            <div key={input.id} className="input-item">
                                                <div className="input-header">
                                                    <input
                                                        type="text"
                                                        value={input.label}
                                                        onChange={(e) => updateInput(input.id, 'label', e.target.value)}
                                                        placeholder="Input label"
                                                        className="input-label-field"
                                                    />
                                                    <select
                                                        value={input.type}
                                                        onChange={(e) => updateInput(input.id, 'type', e.target.value)}
                                                        className="input-type-select"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="multiline">Multiline</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeInput(input.id)}
                                                        className="remove-input-btn"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                                
                                                <div className="input-value">
                                                    {input.type === 'multiline' ? (
                                                        <textarea
                                                            value={input.value}
                                                            onChange={(e) => updateInput(input.id, 'value', e.target.value)}
                                                            placeholder="Enter input value..."
                                                            className="input-textarea"
                                                            rows={3}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={input.type === 'number' ? 'number' : 'text'}
                                                            value={input.value}
                                                            onChange={(e) => updateInput(input.id, 'value', e.target.value)}
                                                            placeholder="Enter input value..."
                                                            className="input-value-field"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setShowInputModal(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={executeWithInputs} className="execute-btn">
                                <FiPlay size={16} />
                                Run with Inputs
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeInput;
