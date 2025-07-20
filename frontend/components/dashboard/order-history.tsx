import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Package, Truck } from "lucide-react"

export function OrderHistory() {
  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 299.99,
      items: 3,
      trackingNumber: "TRK123456789",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "shipped",
      total: 149.99,
      items: 1,
      trackingNumber: "TRK987654321",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "processing",
      total: 79.99,
      items: 2,
      trackingNumber: null,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <Package className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order History</h2>
        <p className="text-gray-600">{orders.length} orders</p>
      </div>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order {order.id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.date).toLocaleDateString()} • {order.items} items
                </CardDescription>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">₹{order.total}</p>
                {order.trackingNumber && <p className="text-sm text-gray-600">Tracking: {order.trackingNumber}</p>}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {order.status === "delivered" && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
                {order.trackingNumber && (
                  <Button variant="outline" size="sm">
                    <Truck className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
