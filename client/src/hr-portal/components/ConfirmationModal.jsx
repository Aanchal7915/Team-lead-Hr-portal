// src/components/dashboard/ConfirmationModal.js
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx'
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';

const ConfirmationModal = ({ isOpen, onClose, employee, action, onConfirm }) => {
    const [hrPassword, setHrPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    
    const requiredText = action === 'deactivate' ? `deactivate ${employee?.name}` : `reactivate ${employee?.name}`;
    const isConfirmed = confirmText.toLowerCase() === requiredText.toLowerCase();

    useEffect(() => {
        if (!isOpen) {
            setHrPassword('');
            setConfirmText('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm(hrPassword);
    };

    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Confirm ${action}`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    You are about to <span className="font-bold">{action}</span> the account for <span className="font-bold">{employee.name}</span>.
                </p>
                <p className="text-sm">To proceed, please type "<span className="font-bold text-red-600">{requiredText}</span>" in the box below and enter your password.</p>
                
                <Input 
                    id="confirmText"
                    label="Confirmation Text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                />
                <Input 
                    id="hrPassword"
                    label="Your Password"
                    type="password"
                    value={hrPassword}
                    onChange={(e) => setHrPassword(e.target.value)}
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleConfirm} variant="danger" disabled={!isConfirmed || !hrPassword}>
                        Confirm {action}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
