import { UserProfile } from "@/components/dashboard/user-profile"
import { OrderHistory } from "@/components/dashboard/order-history"
import { AddressBook } from "@/components/dashboard/address-book"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="addresses" className="mt-6">
            <AddressBook />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
