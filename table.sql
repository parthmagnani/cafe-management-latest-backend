create table users(
    id int primary key Auto_Increment,
    name varchar(250),
    contactNumber varchar(20),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20)

    unique(email)
)

insert into users 
(name, contactNumber, email, password, status, role)
values
('Ram charan', '7567860829', 'magnani.parth2312@gmail.com', 'Gts123', 'true','admin' )

create table category(
    id int NOT NULL Auto_Increment,
    name varchar(250) NOT NULL,
    
    primary key(id)
)

create table product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryId int NOT NULL,
    description varchar(255),
    price int,
    status Boolean,
    primary key (id)
)

create table bill(
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    contactNumber varchar(20) NOT NULL,
    paymentMethod varchar(50) NOT NULL,
    total int NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(255) NOT NULL,
    primary key(id)
);