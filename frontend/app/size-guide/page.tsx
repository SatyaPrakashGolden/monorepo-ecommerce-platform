export default function SizeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Size Guide</h1>

        <div className="space-y-12">
          {/* Women's Sizing */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Women's Clothing</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="gradient-royal-primary text-white">
                    <th className="border border-gray-300 p-3 text-left">Size</th>
                    <th className="border border-gray-300 p-3 text-left">Bust (inches)</th>
                    <th className="border border-gray-300 p-3 text-left">Waist (inches)</th>
                    <th className="border border-gray-300 p-3 text-left">Hips (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">XS</td>
                    <td className="border border-gray-300 p-3">32-34</td>
                    <td className="border border-gray-300 p-3">24-26</td>
                    <td className="border border-gray-300 p-3">34-36</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">S</td>
                    <td className="border border-gray-300 p-3">34-36</td>
                    <td className="border border-gray-300 p-3">26-28</td>
                    <td className="border border-gray-300 p-3">36-38</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">M</td>
                    <td className="border border-gray-300 p-3">36-38</td>
                    <td className="border border-gray-300 p-3">28-30</td>
                    <td className="border border-gray-300 p-3">38-40</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">L</td>
                    <td className="border border-gray-300 p-3">38-40</td>
                    <td className="border border-gray-300 p-3">30-32</td>
                    <td className="border border-gray-300 p-3">40-42</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">XL</td>
                    <td className="border border-gray-300 p-3">40-42</td>
                    <td className="border border-gray-300 p-3">32-34</td>
                    <td className="border border-gray-300 p-3">42-44</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Men's Sizing */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Men's Clothing</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="gradient-royal-blue text-white">
                    <th className="border border-gray-300 p-3 text-left">Size</th>
                    <th className="border border-gray-300 p-3 text-left">Chest (inches)</th>
                    <th className="border border-gray-300 p-3 text-left">Waist (inches)</th>
                    <th className="border border-gray-300 p-3 text-left">Neck (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">S</td>
                    <td className="border border-gray-300 p-3">34-36</td>
                    <td className="border border-gray-300 p-3">28-30</td>
                    <td className="border border-gray-300 p-3">14-14.5</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">M</td>
                    <td className="border border-gray-300 p-3">38-40</td>
                    <td className="border border-gray-300 p-3">32-34</td>
                    <td className="border border-gray-300 p-3">15-15.5</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">L</td>
                    <td className="border border-gray-300 p-3">42-44</td>
                    <td className="border border-gray-300 p-3">36-38</td>
                    <td className="border border-gray-300 p-3">16-16.5</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">XL</td>
                    <td className="border border-gray-300 p-3">46-48</td>
                    <td className="border border-gray-300 p-3">40-42</td>
                    <td className="border border-gray-300 p-3">17-17.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Measurement Tips */}
          <div className="gradient-luxury-cream rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">How to Measure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">For Women:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Bust:</strong> Measure around the fullest part of your chest
                  </li>
                  <li>
                    <strong>Waist:</strong> Measure around your natural waistline
                  </li>
                  <li>
                    <strong>Hips:</strong> Measure around the fullest part of your hips
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">For Men:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Chest:</strong> Measure around the fullest part of your chest
                  </li>
                  <li>
                    <strong>Waist:</strong> Measure around your natural waistline
                  </li>
                  <li>
                    <strong>Neck:</strong> Measure around the base of your neck
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
