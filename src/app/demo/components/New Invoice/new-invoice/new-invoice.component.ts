import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { an } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-new-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Import FormsModule here
  ],
  templateUrl: './new-invoice.component.html',
  styleUrl: './new-invoice.component.scss'
})
export class NewInvoiceComponent {


  loginType: string = 'Citizen'; // Default selection
  login: boolean = false;  // Controls the visibility of the form


  // You can add a method to perform actions based on the selected type
  loginAsType() {
    this.login = true;
    if (this.loginType === 'Citizen') {
      alert('You logging in as an Citizen')
    } else {
      alert('You logging in as an UnCitizen');
    }
  }
  clinics = [
    { id: 1, name: 'عيادة الباطنة' },
    { id: 2, name: 'عيادة الصدر' },
    { id: 3, name: 'عيادة القلب' },
    { id: 4, name: 'عيادة العيون' },
    { id: 5, name: 'عيادة الأسنان' },
    { id: 6, name: 'عيادة الجلدية' },
    { id: 7, name: 'عيادة الأطفال' },
    { id: 8, name: 'عيادة النساء والتوليد' },
    { id: 9, name: 'عيادة الطب النفسي' },
    { id: 10, name: 'عيادة الطب الطبيعي' }
  ];

  services: any[] = [];
  data: any[] = []; // لتخزين البيانات المدخلة

  selectedService: string | null = null; // Initialize to null or undefined
  selectedClinic: string | null = null; // Initialize to null or undefined

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>('assets/ServicesWithTax.json').subscribe(data => {
      // Assuming the first half of the data is clinics
      // Assuming the second half of the data is services
      this.services = data;
    });
  }

  onSubmit() {
    console.log('Selected Clinic:', this.selectedClinic);
    console.log('Selected Service:', this.selectedService);
  }

  onServiceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedService = selectElement.value;
    console.log('Selected Service ID:', this.selectedService); // Optional: log the selected value
  }

  onClinicChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedClinic = selectElement.value;
    console.log('Selected Clinic ID:', this.selectedClinic); // Optional: log the selected value
  }
  selectedServiceData: any;
  price: any;
  addData() {
    if (this.selectedService && this.selectedClinic) {
      this.selectedServiceData = this.services.find(service => service.id === +this.selectedService);
      if (this.selectedServiceData) {
        const item = {
          serviceId: this.selectedService,
          clinicId: this.selectedClinic,
          price: this.selectedServiceData.servicePrice,
          insurance: 'تأمين عادي', // يمكنك تخصيص التأمين حسب الحاجة
          taxForCitizen: this.selectedServiceData.serviceTax,
          taxForUnCitizen: this.selectedServiceData.serviceTax,

        };


        this.price = item.price;

        this.data.push(item);
        this.CalInvoice();
      }
    }
  }

  removeData(item: any) {
    this.data = this.data.filter(dataItem => dataItem !== item);
    this.CalInvoice() ; 
  }
  resetSelections() {
    this.selectedService = null;
    this.selectedClinic = null;
  }
  getServiceName(serviceId: string) {
    const service = this.services.find(s => s.id === +serviceId);
    return service ? service.name : 'غير معروف'; // Return the service name or 'Unknown'
  }
  amount = 20;
  amountPaid: number | null = null; // Amount paid by the client
  amountDue: number | null = null; // Amount remaining


  amountt: any;
  message: string = '';
  discount: number = 0;
  tax = 0;
  total = 0;
  insurancePay = 0;
  patientPay = 0;
  taxes = 0;
  
  CalInvoice() {
    let allTaxes = 0;
    this.total = 0; // Reset total before calculation
    this.tax = 0;   // Reset tax before calculation

    if (this.loginType == 'Citizen') {
      // Loop over all services to calculate total and tax for Citizen
      for (let index = 0; index < this.data.length; index++) {
        const service = this.data[index];
        this.total += service.price; // Add each service price to total

        // Calculate total tax for citizen from the tax array of each service
        for (let taxIndex = 0; taxIndex < service.taxForCitizen.length; taxIndex++) {
          allTaxes += service.taxForCitizen[taxIndex].tax.taxForCitizen;
        }
      }
      this.taxes = allTaxes;

      // Calculate final tax (divide by 100 to convert percentage to decimal)
      this.tax = allTaxes / 100;

      // Apply the tax to the total
      this.total = this.total * (1 + this.tax);
      this.patientPay = this.total; // Assign the final total to patientPay

    } 
    else { // Non-Citizen logic
      allTaxes = 0; // Reset allTaxes for UnCitizen
      this.total = 0; // Reset total before calculation

      // Loop over all services to calculate total and tax for Non-Citizen
      for (let index = 0; index < this.data.length; index++) {
        const service = this.data[index];
        this.total += service.price; // Add each service price to total
        // Assuming taxForUnCitizen is an array (similar to taxForCitizen)
        for (let taxIndex = 0; taxIndex < service.taxForUnCitizen.length; taxIndex++) {
          allTaxes += service.taxForUnCitizen[taxIndex].tax.taxForUnCitizen;
        }
      }
      this.taxes = allTaxes;

      // Calculate final tax (divide by 100 to convert percentage to decimal)
      this.tax = allTaxes / 100;


      // Apply the tax to the total
      this.total = this.total * (1 + this.tax);
      this.patientPay = this.total; // Assign the final total to patientPay
    }
  }


  keyup(value: string) {
    const enteredValue = Number(value); // Convert the input value to a number

    // Check if enteredValue is a valid number
    if (!isNaN(enteredValue) && enteredValue >= 0 && this.data.length > 0) {
      this.amountt = this.total - enteredValue;

      // Show the message
      this.message = `متبقي عليه: ${this.amountt}`; // Show the remaining amount
    } else {
      this.message = ''; // Clear the message if input is invalid
    }
  }


}
