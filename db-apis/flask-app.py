from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import requests
from botocore.exceptions import ClientError
import json

app = Flask(__name__)

# Function to authenticate with Google Sheets
def authenticate_google_sheets(credentials_file, sheet_name):
    scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_file, scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key("1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4")
    return sheet

# Function to get Google Sheets data
def get_google_sheets_data(sheet, sheet_index):
    records = sheet.get_worksheet(sheet_index).get_all_records()
    return records

# Function to update database
def update_db(updated_products):
    
    base_url = "http://127.0.0.1:5000/products"
    for product in updated_products:
        url = f"{base_url}/{product['bar_code_id']}"
        response = requests.put(url, json=product)
        print("Updated product:", response.json())
    return {"status": "success", "updated_products": updated_products}

@app.route('/update-products', methods=['POST'])
def update_products():
    try:
        credentials_file = 'g-auth.json'
        sheet_name = 'Sheet2'
        sheet_index = 3

        sheet = authenticate_google_sheets(credentials_file, sheet_name)
        sheet_data = get_google_sheets_data(sheet, sheet_index)

        url = "http://127.0.0.1:5000/products"
        response = requests.get(url)
        products = response.json()

        updated_products = []
        new_products = []

        for row in sheet_data:
            found = False
            for product in products:
                if (str(row['Bar Code']).strip() == str(product["bar_code_id"]).strip() and 
                    str(row["Price"]) != str(product["price"])) or (
                    str(row['Current Stock']).strip() == str(product["current_stock"]).strip()):
                    found = True
                    updated_products.append({
                        "bar_code_id": str(row['Bar Code']),
                        "product_name": str(row['Product Name']),
                        "price": str(row['Price']),
                        "current_stock": str(row['Current Stock']),
                        "category": str(row['Category']),
                    })
                    break
            if not found:
                new_products.append({
                    "bar_code_id": str(row['Bar Code']),
                    "product_name": str(row['Product Name']),
                    "price": str(row['Price']),
                    "current_stock": str(row['Current Stock']),
                    "category": str(row['Category']),
                })

        if updated_products:
            update_db(updated_products)
        if new_products:
            batch_url = "http://127.0.0.1:5000/batch-create-products"
            requests.post(batch_url, json=new_products)

        return jsonify({"status": "success", "updated_products": updated_products, "new_products": new_products})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/gsheet-update-invoice', methods=['POST'])
def gsheet_update_invoice():
    try:
        credentials_file = 'g-auth.json'
        sheet_name = 'Invoices'
        sheet_index = 2
        sheet = authenticate_google_sheets(credentials_file, sheet_name)
        sheet_data = get_google_sheets_data(sheet, sheet_index)

        item = request.json
        invoice_number = item['InvoiceNumber']
        found = False
        row_index = 0

        for row in sheet_data:
            row_index += 1
            if str(row['Invoice Number']) == str(invoice_number):
                found = True
                break

        worksheet = sheet.get_worksheet(sheet_index)
        if not found:
            worksheet.insert_row([invoice_number, str(item)], row_index)
        else:
            worksheet.update_cell(row_index, 2, str(item))

        return jsonify({"status": "success", "message": "Invoice updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update-invoice', methods=['POST'])
def update_invoice():
    try:
        credentials_file = 'g-auth.json'
        sheet_name = 'Invoices'
        sheet_index = 2
        sheet = authenticate_google_sheets(credentials_file, sheet_name)
        sheet_data = get_google_sheets_data(sheet, sheet_index)
        # print("Sheet data:", sheet_data)
        invoice_list =[]
        for row in sheet_data:
            print(str(row['Invoice Number']))
            invoice_details = row["Invoice Details"]
            # replace single quotes with double quotes
            invoice_details = invoice_details.replace("'", "\"")
            invoice_details = json.loads(invoice_details)
            print("Invoice Date:", invoice_details['date'])

            sample_dict = {
                "InvoiceNumber": str(row['Invoice Number']),
                "date": str(invoice_details['date']),
                "customerName": str(invoice_details['customerName']),
                "upi": str(invoice_details['upi']),
                "cash": str(invoice_details['cash']),
                "credit": str(invoice_details['credit']),
                "amount_paid": str(invoice_details['amount_paid']),
                "invoice_status": str(invoice_details['invoice_status']),
                "products": invoice_details['products']
            }
            invoice_list.append(sample_dict)

        batch_create_url = "http://127.0.0.1:5000/batch-create-invoices"
        response = requests.post(batch_create_url, json=invoice_list)
        return jsonify({"status": "success", "response": response.json()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth', methods=['POST'])
def authenticate():
    try:
        item = request.json
        print("Item:", item)
        return jsonify({"status": "success", "message": "Variables printed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
