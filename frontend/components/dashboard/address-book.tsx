"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"

interface Address {
  id: string
  type: "home" | "work" | "other"
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      name: "John Doe",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      isDefault: true,
    },
    {
      id: "2",
      type: "work",
      name: "John Doe",
      street: "456 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      country: "United States",
      isDefault: false,
    },
  ])

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Address Book</h2>
        <Button className="gradient-royal-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <CardTitle className="text-lg capitalize">{address.type}</CardTitle>
                </div>
                {address.isDefault && <Badge className="gradient-royal-primary text-white border-0">Default</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{address.name}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
                {!address.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
