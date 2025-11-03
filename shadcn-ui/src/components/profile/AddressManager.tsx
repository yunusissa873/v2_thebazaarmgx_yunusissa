import { useState } from 'react';
import { Plus, MapPin, Trash2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  addresses?: Address[];
  onSave?: (address: AddressFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSetDefault?: (id: string) => Promise<void>;
}

export function AddressManager({
  addresses = [],
  onSave,
  onDelete,
  onSetDefault,
}: AddressManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<AddressFormData>({
    defaultValues: {
      label: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Kenya',
      isDefault: false,
    },
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      form.reset({
        label: address.label,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      form.reset({
        label: '',
        street: '',
        city: '',
        postalCode: '',
        country: 'Kenya',
        isDefault: addresses.length === 0, // First address is default
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: AddressFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      toast.error('Failed to save address. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        if (onDelete) {
          await onDelete(id);
          toast.success('Address deleted successfully');
        }
      } catch (error) {
        toast.error('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      if (onSetDefault) {
        await onSetDefault(id);
        toast.success('Default address updated');
      }
    } catch (error) {
      toast.error('Failed to update default address. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Delivery Addresses</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-netflix-red hover:bg-netflix-red/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-netflix-dark-gray border-netflix-medium-gray text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingAddress
                  ? 'Update your delivery address details'
                  : 'Add a new delivery address for your orders'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  rules={{ required: 'Label is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Home, Work, etc."
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
                  name="street"
                  rules={{ required: 'Street address is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your street address"
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
                    name="city"
                    rules={{ required: 'City is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City"
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
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Postal code"
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
                  name="country"
                  rules={{ required: 'Country is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Country</FormLabel>
                      <FormControl>
                        <Input
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
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1 h-4 w-4 w-4 rounded border-gray-300 bg-netflix-medium-gray text-netflix-red focus:ring-netflix-red"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white cursor-pointer">
                          Set as default shipping address
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
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border border-netflix-medium-gray rounded-lg bg-netflix-dark-gray">
          <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No delivery addresses saved</p>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg border ${
                address.isDefault
                  ? 'border-netflix-red bg-netflix-red/10'
                  : 'border-netflix-medium-gray bg-netflix-dark-gray'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{address.label}</h4>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-netflix-red text-white rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {address.street}
                    <br />
                    {address.city}, {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(address.id)}
                      className="text-gray-400 hover:text-white"
                      title="Set as default"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(address)}
                    className="text-gray-400 hover:text-white"
                    title="Edit address"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete address"
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

