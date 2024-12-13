"use client";

import { useState, useEffect } from 'react';
import { use } from 'react';
import { projectStore } from '@/lib/store/projects';

interface TreeNode {
  name: string;
  type: 'directory' | 'file';
  children?: TreeNode[];
}

export default function ProjectTreePage({ params }: { params: { id: string } }) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams?.id) {
      const pages = projectStore.getProjectPages(resolvedParams.id);
      const components = projectStore.getProjectComponents(resolvedParams.id);

      const tree: TreeNode[] = [
        {
          name: 'src',
          type: 'directory',
          children: [
            {
              name: 'app',
              type: 'directory',
              children: pages?.map(page => ({
                name: `${page.path === '/' ? 'page' : page.path}/page.tsx`,
                type: 'file'
              })) || []
            },
            {
              name: 'components',
              type: 'directory',
              children: components?.map(component => ({
                name: `${component.name}.tsx`,
                type: 'file'
              })) || []
            },
            {
              name: 'types',
              type: 'directory',
              children: [
                { name: 'todo.ts', type: 'file' }
              ]
            },
            {
              name: 'lib',
              type: 'directory',
              children: []
            }
          ]
        }
      ];

      setTreeData(tree);
    }
  }, [resolvedParams?.id]);

  const TreeNode = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => (
    <div style={{ marginLeft: `${depth * 20}px` }} className="py-1">
      <div className="flex items-center">
        {node.type === 'directory' ? (
          <span className="text-yellow-500 mr-2">📁</span>
        ) : (
          <span className="text-blue-500 mr-2">📄</span>
        )}
        <span className="text-gray-200">{node.name}</span>
      </div>
      {node.children?.map((child, index) => (
        <TreeNode key={index} node={child} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Project Structure</h1>
      <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
        {treeData.map((node, index) => (
          <TreeNode key={index} node={node} />
        ))}
      </div>
    </div>
  );
} 