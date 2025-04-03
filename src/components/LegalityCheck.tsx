
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CircleCheck, CircleX, AlertTriangle, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// This would ideally come from a database or API
const MOCK_LEGAL_PLATES = [
  'ABC123', 'XYZ789', 'DEF456', 'GHI789', 'JKL012'
];

interface LegalityCheckProps {
  detectedPlate: string | null;
  confidence: number;
  onLegalityDetermined: (isLegal: boolean, plateNumber: string, region: string) => void;
}

const LegalityCheck: React.FC<LegalityCheckProps> = ({ 
  detectedPlate, 
  confidence,
  onLegalityDetermined
}) => {
  const [manualPlate, setManualPlate] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US-CA');
  const [verificationResult, setVerificationResult] = useState<{isLegal: boolean, message: string} | null>(null);

  const checkLegality = (plateNumber: string) => {
    // This is a mock implementation - in a real app, this would call an API
    // to check against a database of registered/legal plates
    const isLegal = MOCK_LEGAL_PLATES.includes(plateNumber);
    
    setVerificationResult({
      isLegal,
      message: isLegal 
        ? 'This license plate is registered and legal.' 
        : 'Warning: This license plate is not found in the database.'
    });
    
    // Notify parent component about the legality check result
    onLegalityDetermined(isLegal, plateNumber, selectedRegion);
  };

  const handleManualCheck = () => {
    if (!manualPlate.trim()) {
      return;
    }
    checkLegality(manualPlate.trim().toUpperCase());
  };

  const handleDetectedCheck = () => {
    if (detectedPlate) {
      checkLegality(detectedPlate);
    }
  };

  const regions = [
    { value: 'US-CA', label: 'California, USA' },
    { value: 'US-NY', label: 'New York, USA' },
    { value: 'US-TX', label: 'Texas, USA' },
    { value: 'CA-ON', label: 'Ontario, Canada' },
    { value: 'UK-ENG', label: 'England, UK' },
    { value: 'AU-NSW', label: 'New South Wales, Australia' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-alpr-800">
          <Search className="h-5 w-5 text-alpr-600" />
          Plate Legality Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {detectedPlate && (
          <div className="p-3 bg-alpr-50 rounded-md">
            <div className="font-semibold text-alpr-800">Detected Plate:</div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-2xl font-mono">{detectedPlate}</span>
              <Badge variant="outline" className="text-xs">
                Confidence: {confidence.toFixed(1)}%
              </Badge>
            </div>
            <Button 
              onClick={handleDetectedCheck}
              className="mt-2 w-full bg-alpr-600 hover:bg-alpr-700"
            >
              Verify Detected Plate
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="region">Select Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-plate">Manual Plate Entry</Label>
            <div className="flex gap-2">
              <Input
                id="manual-plate"
                placeholder="Enter license plate"
                value={manualPlate}
                onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button 
                onClick={handleManualCheck}
                variant="outline"
                className="shrink-0"
              >
                Verify
              </Button>
            </div>
          </div>
        </div>

        {verificationResult && (
          <div className={`mt-4 p-4 rounded-md ${
            verificationResult.isLegal 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {verificationResult.isLegal ? (
                <CircleCheck className="h-5 w-5 text-green-600" />
              ) : (
                <CircleX className="h-5 w-5 text-red-600" />
              )}
              <p className={verificationResult.isLegal ? 'text-green-700' : 'text-red-700'}>
                {verificationResult.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LegalityCheck;
