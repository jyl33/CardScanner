# CardScanner

This app allows for inventory, order and customer management for dealers/buyers of trading sports cards. Built to reduce manual time spent on adding/removing inventory by utilizing the existing QR codes on PSA graded cards.

Features include:
* Inventory management - Scanning in cards, bulk adding cards from spreadsheet, adding cards manually, exporting inventory lists, viewing and filtering inventory
* PSA integration - automatically pull card info from the PSA database when scanning in cards (Via public PSA API)
* Order management - create new order via scanning or selecting existing cards, automatically calculate profit margin
* Buyer/Seller management - attribute orders to buyers to track buyer spend and relationship
* Mobile first approach - compatible with iOS, andriod and desktop devices. Mobile first experience allows for ease of use on the go (card shows, shops, etc.)

Built with Expo and React Native for cross-platform mobile development, with Supabase providing the backend database and authentication services. UI enhanced using React Native Community components, Lucide React icons, and Tailwind CSS
