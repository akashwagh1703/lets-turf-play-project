import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({ 
  data, 
  columns, 
  height = 400, 
  itemHeight = 60,
  onRowClick,
  className = ""
}) => {
  const memoizedData = useMemo(() => data, [data]);

  const Row = ({ index, style }) => {
    const item = memoizedData[index];
    
    return (
      <div 
        style={style} 
        className={`flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${className}`}
        onClick={() => onRowClick?.(item)}
      >
        {columns.map((column, colIndex) => (
          <div 
            key={colIndex}
            className={`px-4 py-3 ${column.className || ''}`}
            style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
          >
            {column.render ? column.render(item) : item[column.key]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200">
        {columns.map((column, index) => (
          <div 
            key={index}
            className={`px-4 py-3 font-medium text-gray-700 ${column.className || ''}`}
            style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
          >
            {column.title}
          </div>
        ))}
      </div>
      
      {/* Virtualized Body */}
      <List
        height={height}
        itemCount={memoizedData.length}
        itemSize={itemHeight}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedTable;