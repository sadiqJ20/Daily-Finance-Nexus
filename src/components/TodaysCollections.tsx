
import { Calendar, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TodaysCollectionsProps {
  collections: any[];
  onMarkPayment: (loanId: string, status: 'paid' | 'missed') => void;
}

const TodaysCollections = ({ collections, onMarkPayment }: TodaysCollectionsProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Today's Collections ({collections.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collections.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No collections due today</p>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{collection.shopkeeperName}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {collection.shopkeeperPhone}
                    </p>
                    <p className="text-sm text-gray-500">₹{collection.dailyEmi} due</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {collection.todayStatus === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onMarkPayment(collection.id, 'paid')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkPayment(collection.id, 'missed')}
                      >
                        Mark Missed
                      </Button>
                    </>
                  ) : (
                    <Badge variant={collection.todayStatus === 'paid' ? 'default' : 'destructive'}>
                      {collection.todayStatus === 'paid' ? 'Paid' : 'Missed'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysCollections;
