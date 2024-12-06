import React from 'react';
import useMemoStore from '../../store/memoStore';

const AssigneeInfo = ({ assignedTo }) => {
  const { familyMembers } = useMemoStore();
  const assignee = familyMembers.find(member => String(member.id) === String(assignedTo));
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500">分配给:</span>
      {assignee ? (
        <div className="flex items-center space-x-1">
          <span className="text-xl">{assignee.avatar}</span>
          <span className="text-gray-700 font-medium">{assignee.name}</span>
        </div>
      ) : (
        <span className="text-gray-400 italic">未分配</span>
      )}
    </div>
  );
};

export default AssigneeInfo;