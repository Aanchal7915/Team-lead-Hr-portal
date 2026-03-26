import React from 'react';
import { useParams } from 'react-router-dom';
const HREmployeeView = () => {
    const { id } = useParams();
    return <div>Viewing/Editing Employee with ID: {id} - Coming Soon!</div>;
};
export default HREmployeeView;
