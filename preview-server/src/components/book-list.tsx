"use client";

"use client";

import { Book } from '../../app/daily-reading/types';
import { Button } from '../ui/button';

interface BookListProps {
  books: Book[];
  onMarkAsRead: (id: string) => void;
}

export function BookList({ books, onMarkAsRead }: BookListProps) {
  return (
    <ul className="space-y-4">
      {books.map((book) => (
        <li key={book.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div>
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p className="text-gray-600">{book.author}</p>
          </div>
          <Button
            onClick={() => onMarkAsRead(book.id)}
            disabled={book.read}
            className={book.read ? 'bg-green-500' : 'bg-blue-500'}
          >
            {book.read ? 'Read' : 'Mark as Read'}
          </Button>
        </li>
      ))}
    </ul>
  );
}