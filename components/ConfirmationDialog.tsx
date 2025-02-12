import React, { useState } from 'react';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Text } from "~/components/ui/text";
import { PSAResponse } from '@/types/psaResponse';
import { psaCardService } from '../services/database';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';



interface ConfirmationDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  item: PSAResponse | null;
}

const ConfirmationDialog = ({ visible, onConfirm, onCancel, item }: ConfirmationDialogProps) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [value, setValue] = React.useState('');


  const handleConfirm = async () => {
    if (item) {
      console.log("Adding item to inventory:", item);
      const result = await psaCardService.create(item);

      if (result.success) {
        console.log("Item added to inventory:", result.data);
        setNotification({
          message: "Item successfully added to inventory!",
          type: 'success'
        });
      } else {
        console.error("Error adding item to inventory:", result.error);
        setNotification({
          message: result.error || "An unknown error occurred",
          type: 'error'
        });
      }

      // Clear notification and close dialog after delay
      setTimeout(() => {
        setNotification(null);
        onConfirm();
      }, 3000);
    }
  };

  return (
    <>
      <AlertDialog open={visible} onOpenChange={(open) => !open && onCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><Text className='text-center'>Scanned Card</Text></AlertDialogTitle>
            {item && (
              <AlertDialogDescription>
                <View className="flex flex-col items-center gap-4 py-4">
                  <Text className="text-base font-bold text-center">
                    {item.PSACert.Year} {item.PSACert.Brand} {item.PSACert.Subject}
                  </Text>
                  <Text className="text-sm text-center">
                    {item.PSACert.CardGrade}
                  </Text>
                  <Text className="text-sm text-center">
                    Cert Number: {item.PSACert.CertNumber}
                  </Text>
                </View>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={onCancel}><Text>Cancel</Text></AlertDialogCancel>
            <AlertDialogAction onPress={handleConfirm}>
              <Text>Add to Inventory</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notification && (
        <View className="absolute bottom-[10%] left-[10%] right-[10%] z-50">
          <Alert icon = {ChevronDown} variant={notification.type === 'success' ? 'default' : 'destructive'}>
            <AlertTitle>
              {notification.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {notification.message}
            </AlertDescription>
          </Alert>
        </View>
      )}
    </>
  );
};

export default ConfirmationDialog;