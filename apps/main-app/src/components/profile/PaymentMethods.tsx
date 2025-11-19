import { useState } from 'react';
import { Plus, CreditCard, Smartphone, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Label } from '@thebazaar/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@thebazaar/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@thebazaar/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@thebazaar/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card';
  label: string;
  lastFour?: string;
  phoneNumber?: string;
  isDefault: boolean;
}

interface PaymentFormData {
  type: 'mpesa' | 'card';
  label: string;
  phoneNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  paymentMethods?: PaymentMethod[];
  onSave?: (method: PaymentFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSetDefault?: (id: string) => Promise<void>;
}

export function PaymentMethods({
  paymentMethods = [],
  onSave,
  onDelete,
  onSetDefault,
}: PaymentMethodsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [paymentType, setPaymentType] = useState<'mpesa' | 'card'>('mpesa');

  const form = useForm<PaymentFormData>({
    defaultValues: {
      type: 'mpesa',
      label: '',
      phoneNumber: '',
      isDefault: false,
    },
  });

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setPaymentType(method.type);
      form.reset({
        type: method.type,
        label: method.label,
        phoneNumber: method.phoneNumber || '',
        isDefault: method.isDefault,
      });
    } else {
      setEditingMethod(null);
      setPaymentType('mpesa');
      form.reset({
        type: 'mpesa',
        label: '',
        phoneNumber: '',
        isDefault: paymentMethods.length === 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success(editingMethod ? 'Payment method updated' : 'Payment method added');
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      toast.error('Failed to save payment method. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      try {
        if (onDelete) {
          await onDelete(id);
          toast.success('Payment method removed');
        }
      } catch (error) {
        toast.error('Failed to remove payment method. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-netflix-red hover:bg-netflix-red/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-netflix-dark-gray border-netflix-medium-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Link a payment method for faster checkout
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  rules={{ required: 'Payment type is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Payment Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setPaymentType(value as 'mpesa' | 'card');
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-netflix-medium-gray border-netflix-medium-gray text-white">
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  rules={{ required: 'Label is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {paymentType === 'mpesa' ? 'Phone Number Label' : 'Card Label'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={paymentType === 'mpesa' ? 'My M-Pesa' : 'My Card'}
                          className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentType === 'mpesa' ? (
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    rules={{
                      required: 'Phone number is required',
                      pattern: {
                        value: /^(\+254|0)[7]\d{8}$/,
                        message: 'Please enter a valid Kenyan phone number',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">M-Pesa Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+254 712 345 678"
                            className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      rules={{
                        required: 'Card number is required',
                        pattern: {
                          value: /^\d{16}$/,
                          message: 'Please enter a valid 16-digit card number',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              maxLength={16}
                              className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        rules={{
                          required: 'Expiry date is required',
                          pattern: {
                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: 'Please enter in MM/YY format',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Expiry Date</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                maxLength={5}
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvv"
                        rules={{
                          required: 'CVV is required',
                          pattern: {
                            value: /^\d{3,4}$/,
                            message: 'Please enter a valid CVV',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">CVV</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                maxLength={4}
                                type="password"
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="cardholderName"
                      rules={{ required: 'Cardholder name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cardholder Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1 h-4 w-4 rounded border-gray-300 bg-netflix-medium-gray text-netflix-red focus:ring-netflix-red"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white cursor-pointer">
                          Set as default payment method
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-netflix-red hover:bg-netflix-red/90 text-white"
                  >
                    {editingMethod ? 'Update' : 'Add Payment Method'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 border border-netflix-medium-gray rounded-lg bg-netflix-dark-gray">
          <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No payment methods saved</p>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Payment Method
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border ${
                method.isDefault
                  ? 'border-netflix-red bg-netflix-red/10'
                  : 'border-netflix-medium-gray bg-netflix-dark-gray'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {method.type === 'mpesa' ? (
                    <Smartphone className="h-8 w-8 text-green-500" />
                  ) : (
                    <CreditCard className="h-8 w-8 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{method.label}</h4>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-netflix-red text-white rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {method.type === 'mpesa' ? (
                      <p className="text-gray-300 text-sm">{method.phoneNumber}</p>
                    ) : (
                      <p className="text-gray-300 text-sm">•••• •••• •••• {method.lastFour}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(method)}
                    className="text-gray-400 hover:text-white"
                    title="Edit payment method"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Remove payment method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




