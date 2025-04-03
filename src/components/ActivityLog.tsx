
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Clock, Download, Filter, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';

export interface ActivityEntry {
  id: string;
  plateNumber: string;
  region: string;
  isLegal: boolean;
  timestamp: Date;
  confidence: number;
}

interface ActivityLogProps {
  activities: ActivityEntry[];
  onClearLog: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities, onClearLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<'all' | 'legal' | 'illegal'>('all');

  const filteredActivities = activities.filter(entry => {
    const matchesSearch = entry.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterOption === 'all') return matchesSearch;
    if (filterOption === 'legal') return matchesSearch && entry.isLegal;
    if (filterOption === 'illegal') return matchesSearch && !entry.isLegal;
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    if (activities.length === 0) return;
    
    const headers = ['Plate Number', 'Region', 'Status', 'Timestamp', 'Confidence (%)'];
    
    const csvData = activities.map(entry => [
      entry.plateNumber,
      entry.region,
      entry.isLegal ? 'Legal' : 'Illegal',
      entry.timestamp.toLocaleString(),
      entry.confidence.toFixed(1)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `plate-detection-log-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-alpr-800">
          <Clock className="h-5 w-5 text-alpr-600" />
          Activity Log
        </CardTitle>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterOption('all')}>
                All Plates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption('legal')}>
                Legal Plates Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption('illegal')}>
                Illegal Plates Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={activities.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onClearLog}
            disabled={activities.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search plates or regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.plateNumber}</TableCell>
                    <TableCell>{entry.region}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        entry.isLegal 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.isLegal ? 'Legal' : 'Illegal'}
                      </span>
                    </TableCell>
                    <TableCell>{entry.timestamp.toLocaleString()}</TableCell>
                    <TableCell>{entry.confidence.toFixed(1)}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No activity records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
