import React, { useState } from 'react';

const DirectoryTree = () => {
  const [directoryData, setDirectoryData] = useState(null);

  const handleShowTree = () => {
    window.tauri.promisified
      .invoke('get_directory_data')
      .then((data) => {
        setDirectoryData(JSON.parse(data));
      })
      .catch((err) => {
        console.error('Error fetching directory data:', err);
      });
  };

  const renderTree = (node) => {
    if (!node) return null;

    return (
      <div key={node.name}>
        <div>{node.type === 'folder' ? '📁 ' : '📄 '}{node.name}</div>
        {node.children && node.children.map((child) => renderTree(child))}
      </div>
    );
  };

  return (
    <div>
      <h2>Directory Tree</h2>
      <button onClick={handleShowTree}>Show Directory Tree</button>
      {directoryData && (
        <div>
          {renderTree(directoryData)}
        </div>
      )}
    </div>
  );
};

export default DirectoryTree;