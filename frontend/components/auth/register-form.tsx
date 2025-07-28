// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Eye, EyeOff, Facebook, Mail } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Checkbox } from "@/components/ui/checkbox"

// export function RegisterForm() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false,
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle registration logic here
//     console.log("Registration attempt:", formData)
//   }

//   const handleInputChange = (field: string, value: string | boolean) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   return (
//     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <Label htmlFor="firstName">First Name</Label>
//             <Input
//               id="firstName"
//               name="firstName"
//               type="text"
//               required
//               value={formData.firstName}
//               onChange={(e) => handleInputChange("firstName", e.target.value)}
//               className="mt-1"
//               placeholder="First name"
//             />
//           </div>
//           <div>
//             <Label htmlFor="lastName">Last Name</Label>
//             <Input
//               id="lastName"
//               name="lastName"
//               type="text"
//               required
//               value={formData.lastName}
//               onChange={(e) => handleInputChange("lastName", e.target.value)}
//               className="mt-1"
//               placeholder="Last name"
//             />
//           </div>
//         </div>

//         <div>
//           <Label htmlFor="email">Email address</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             required
//             value={formData.email}
//             onChange={(e) => handleInputChange("email", e.target.value)}
//             className="mt-1"
//             placeholder="Enter your email"
//           />
//         </div>

//         <div>
//           <Label htmlFor="password">Password</Label>
//           <div className="relative mt-1">
//             <Input
//               id="password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               autoComplete="new-password"
//               required
//               value={formData.password}
//               onChange={(e) => handleInputChange("password", e.target.value)}
//               placeholder="Create a password"
//             />
//             <button
//               type="button"
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <Label htmlFor="confirmPassword">Confirm Password</Label>
//           <Input
//             id="confirmPassword"
//             name="confirmPassword"
//             type="password"
//             autoComplete="new-password"
//             required
//             value={formData.confirmPassword}
//             onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
//             className="mt-1"
//             placeholder="Confirm your password"
//           />
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="terms"
//           checked={formData.agreeToTerms}
//           onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
//         />
//         <Label htmlFor="terms" className="text-sm">
//           I agree to the{" "}
//           <a href="/terms" className="text-purple-600 hover:text-purple-500">
//             Terms of Service
//           </a>{" "}
//           and{" "}
//           <a href="/privacy" className="text-purple-600 hover:text-purple-500">
//             Privacy Policy
//           </a>
//         </Label>
//       </div>

//       <div>
//         <Button
//           type="submit"
//           className="w-full gradient-royal-primary text-white border-0"
//           disabled={!formData.agreeToTerms}
//         >
//           Create Account
//         </Button>
//       </div>

//       <div className="mt-6">
//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <Separator />
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
//           </div>
//         </div>

//         <div className="mt-6 grid grid-cols-2 gap-3">
//           <Button variant="outline" className="w-full bg-transparent">
//             <Facebook className="h-4 w-4 mr-2" />
//             Facebook
//           </Button>
//           <Button variant="outline" className="w-full bg-transparent">
//             <Mail className="h-4 w-4 mr-2" />
//             Google
//           </Button>
//         </div>
//       </div>
//     </form>
//   )
// }




"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast" // Optional: for showing error/success messages

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:2000/api/user/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailId: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message || "User registered successfully",
        })
        // Navigate to login page after successful registration
        router.push("/login")
      } else {
        throw new Error(result.message || "Registration failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="mt-1"
              placeholder="First name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="mt-1"
              placeholder="Last name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="mt-1"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="mt-1"
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="terms" className="text-sm">
          I agree to the{" "}
          <a href="/terms" className="text-purple-600 hover:text-purple-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-purple-600 hover:text-purple-500">
            Privacy Policy
          </a>
        </Label>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full gradient-royal-primary text-white border-0"
          disabled={!formData.agreeToTerms || isLoading}
        >
          {isLoading ? "Registering..." : "Create Account"}
        </Button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
            <Mail className="h-4 w-4 mr-2" />
            Google
          </Button>
        </div>
      </div>
    </form>
  )
}